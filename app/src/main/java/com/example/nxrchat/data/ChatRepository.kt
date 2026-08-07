package com.example.nxrchat.data

import android.content.Context
import com.example.nxrchat.crypto.CryptoUtils
import com.example.nxrchat.data.local.AppDatabase
import com.example.nxrchat.data.local.FriendEntity
import com.example.nxrchat.data.local.MessageEntity
import com.example.nxrchat.data.local.UserAccountEntity
import com.example.nxrchat.network.P2pClient
import com.example.nxrchat.network.P2pPacket
import com.example.nxrchat.network.P2pServer
import com.example.nxrchat.util.NetworkUtils
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ChatRepository(private val context: Context) {

    private val db = AppDatabase.getInstance(context)
    private val userDao = db.userDao()
    private val friendDao = db.friendDao()
    private val messageDao = db.messageDao()

    val userAccount: Flow<UserAccountEntity?> = userDao.getUserAccount()
    val allFriends: Flow<List<FriendEntity>> = friendDao.getAllFriends()

    private val scope = CoroutineScope(Dispatchers.IO)

    val p2pServer: P2pServer = P2pServer { incomingPacket, clientIp ->
        handleIncomingPacket(incomingPacket, clientIp)
    }

    val isServerListening: StateFlow<Boolean> = p2pServer.isListening

    init {
        // Automatically start local server if account exists
        scope.launch {
            userAccount.collect { account ->
                if (account != null) {
                    p2pServer.startServer(account.listenPort)
                }
            }
        }
    }

    suspend fun createAccount(username: String): UserAccountEntity = withContext(Dispatchers.IO) {
        val keyPair = CryptoUtils.generateKeyPair()
        val account = UserAccountEntity(
            username = username.trim(),
            publicKeyBase64 = keyPair.publicKeyBase64,
            privateKeyBase64 = keyPair.privateKeyBase64,
            fingerprint = keyPair.fingerprint,
            listenPort = 8888
        )
        userDao.saveUserAccount(account)
        p2pServer.startServer(account.listenPort)
        account
    }

    suspend fun updatePort(newPort: Int) = withContext(Dispatchers.IO) {
        userDao.updateListenPort(newPort)
        p2pServer.startServer(newPort)
    }

    fun getMessagesForFriend(friendPublicKeyBase64: String): Flow<List<MessageEntity>> {
        return messageDao.getMessagesForFriend(friendPublicKeyBase64)
    }

    fun getFriendByPublicKey(publicKeyBase64: String): Flow<FriendEntity?> {
        return friendDao.getFriendByPublicKey(publicKeyBase64)
    }

    suspend fun clearUnreadCount(friendPublicKeyBase64: String) = withContext(Dispatchers.IO) {
        friendDao.clearUnreadCount(friendPublicKeyBase64)
    }

    /**
     * Send Handshake to peer by IP & Port to add friend directly.
     */
    suspend fun connectAndAddFriend(
        targetIp: String,
        targetPort: Int,
        customName: String = "",
        providedPublicKeyBase64: String = ""
    ): Result<FriendEntity> = withContext(Dispatchers.IO) {
        val myAccount = userDao.getUserAccountDirect()
            ?: return@withContext Result.failure(IllegalStateException("No local account created"))

        val myIp = NetworkUtils.getLocalIpAddress()

        val handshakePacket = P2pPacket(
            type = "HANDSHAKE",
            senderUsername = myAccount.username,
            senderPublicKeyBase64 = myAccount.publicKeyBase64,
            senderIp = myIp,
            senderPort = myAccount.listenPort
        )

        // Attempt direct connection
        val result = P2pClient.sendPacket(targetIp, targetPort, handshakePacket, timeoutMs = 4000)

        if (result.isSuccess) {
            val response = result.getOrNull()
            val friendKey = response?.senderPublicKeyBase64.takeIf { !it.isNullOrBlank() }
                ?: providedPublicKeyBase64.takeIf { it.isNotBlank() }
                ?: return@withContext Result.failure(Exception("Peer did not return a valid Public Key"))

            val friendName = customName.ifBlank { response?.senderUsername ?: "NXR Peer" }
            val fingerprint = CryptoUtils.computeFingerprint(friendKey)

            val friend = FriendEntity(
                publicKeyBase64 = friendKey,
                username = friendName,
                ipAddress = targetIp,
                port = targetPort,
                fingerprint = fingerprint,
                isOnline = true,
                lastSeenTimestamp = System.currentTimeMillis()
            )

            friendDao.insertOrUpdateFriend(friend)
            Result.success(friend)
        } else {
            // If direct handshake fails, but public key is provided (e.g. via QR code),
            // still save contact so user can message them when they come on LAN.
            if (providedPublicKeyBase64.isNotBlank()) {
                val friendName = customName.ifBlank { "NXR Peer" }
                val fingerprint = CryptoUtils.computeFingerprint(providedPublicKeyBase64)
                val friend = FriendEntity(
                    publicKeyBase64 = providedPublicKeyBase64,
                    username = friendName,
                    ipAddress = targetIp,
                    port = targetPort,
                    fingerprint = fingerprint,
                    isOnline = false,
                    lastSeenTimestamp = System.currentTimeMillis()
                )
                friendDao.insertOrUpdateFriend(friend)
                Result.success(friend)
            } else {
                Result.failure(result.exceptionOrNull() ?: Exception("Failed to connect to $targetIp:$targetPort"))
            }
        }
    }

    /**
     * Send direct text message to friend.
     */
    suspend fun sendMessage(
        friendPublicKeyBase64: String,
        text: String
    ): Result<MessageEntity> = withContext(Dispatchers.IO) {
        val myAccount = userDao.getUserAccountDirect()
            ?: return@withContext Result.failure(IllegalStateException("No local account created"))

        val friend = friendDao.getFriendByPublicKeyDirect(friendPublicKeyBase64)
            ?: return@withContext Result.failure(IllegalArgumentException("Friend not found in database"))

        // Create local pending message
        val localMsg = MessageEntity(
            friendPublicKeyBase64 = friendPublicKeyBase64,
            senderPublicKeyBase64 = myAccount.publicKeyBase64,
            messageText = text.trim(),
            timestamp = System.currentTimeMillis(),
            isFromMe = true,
            status = "SENDING"
        )

        val insertedId = messageDao.insertMessage(localMsg)
        val msgWithId = localMsg.copy(id = insertedId)

        // Encrypt message text using Friend's RSA Public Key
        val encryptedPayload = CryptoUtils.encrypt(text.trim(), friendPublicKeyBase64)

        val packet = P2pPacket(
            type = "CHAT",
            senderUsername = myAccount.username,
            senderPublicKeyBase64 = myAccount.publicKeyBase64,
            senderIp = NetworkUtils.getLocalIpAddress(),
            senderPort = myAccount.listenPort,
            payload = encryptedPayload,
            messageId = insertedId,
            timestamp = msgWithId.timestamp
        )

        val clientResult = P2pClient.sendPacket(friend.ipAddress, friend.port, packet, timeoutMs = 5000)

        if (clientResult.isSuccess) {
            val updatedMsg = msgWithId.copy(status = "DELIVERED")
            messageDao.updateMessage(updatedMsg)
            friendDao.updateOnlineStatus(friendPublicKeyBase64, true)
            Result.success(updatedMsg)
        } else {
            val failedMsg = msgWithId.copy(status = "FAILED")
            messageDao.updateMessage(failedMsg)
            friendDao.updateOnlineStatus(friendPublicKeyBase64, false)
            Result.success(failedMsg) // Returned with status FAILED
        }
    }

    suspend fun retrySendMessage(message: MessageEntity): Result<Unit> = withContext(Dispatchers.IO) {
        val myAccount = userDao.getUserAccountDirect() ?: return@withContext Result.failure(Exception("No account"))
        val friend = friendDao.getFriendByPublicKeyDirect(message.friendPublicKeyBase64)
            ?: return@withContext Result.failure(Exception("Friend not found"))

        messageDao.updateMessageStatus(message.id, "SENDING")

        val encryptedPayload = CryptoUtils.encrypt(message.messageText, friend.publicKeyBase64)

        val packet = P2pPacket(
            type = "CHAT",
            senderUsername = myAccount.username,
            senderPublicKeyBase64 = myAccount.publicKeyBase64,
            senderIp = NetworkUtils.getLocalIpAddress(),
            senderPort = myAccount.listenPort,
            payload = encryptedPayload,
            messageId = message.id,
            timestamp = message.timestamp
        )

        val clientResult = P2pClient.sendPacket(friend.ipAddress, friend.port, packet, timeoutMs = 5000)

        if (clientResult.isSuccess) {
            messageDao.updateMessageStatus(message.id, "DELIVERED")
            friendDao.updateOnlineStatus(friend.publicKeyBase64, true)
            Result.success(Unit)
        } else {
            messageDao.updateMessageStatus(message.id, "FAILED")
            friendDao.updateOnlineStatus(friend.publicKeyBase64, false)
            Result.failure(clientResult.exceptionOrNull() ?: Exception("Retry failed"))
        }
    }

    /**
     * Handles incoming packets received on P2pServer.
     */
    private suspend fun handleIncomingPacket(packet: P2pPacket, clientIp: String): P2pPacket? {
        val myAccount = userDao.getUserAccountDirect() ?: return null

        when (packet.type) {
            "HANDSHAKE" -> {
                // Save/update sender as friend
                val fingerprint = CryptoUtils.computeFingerprint(packet.senderPublicKeyBase64)
                val existingFriend = friendDao.getFriendByPublicKeyDirect(packet.senderPublicKeyBase64)
                val friend = FriendEntity(
                    publicKeyBase64 = packet.senderPublicKeyBase64,
                    username = packet.senderUsername.ifBlank { existingFriend?.username ?: "NXR Peer" },
                    ipAddress = clientIp.ifBlank { packet.senderIp },
                    port = packet.senderPort,
                    fingerprint = fingerprint,
                    isOnline = true,
                    lastSeenTimestamp = System.currentTimeMillis()
                )
                friendDao.insertOrUpdateFriend(friend)

                // Return Handshake ACK with my profile info
                return P2pPacket(
                    type = "HANDSHAKE_ACK",
                    senderUsername = myAccount.username,
                    senderPublicKeyBase64 = myAccount.publicKeyBase64,
                    senderIp = NetworkUtils.getLocalIpAddress(),
                    senderPort = myAccount.listenPort
                )
            }

            "CHAT" -> {
                // Decrypt message payload
                val decryptedText = CryptoUtils.decrypt(packet.payload, myAccount.privateKeyBase64)

                // Save message in DB
                val message = MessageEntity(
                    friendPublicKeyBase64 = packet.senderPublicKeyBase64,
                    senderPublicKeyBase64 = packet.senderPublicKeyBase64,
                    messageText = decryptedText,
                    timestamp = packet.timestamp,
                    isFromMe = false,
                    status = "RECEIVED"
                )
                messageDao.insertMessage(message)

                // Update sender in contacts if exists, or auto-add
                var friend = friendDao.getFriendByPublicKeyDirect(packet.senderPublicKeyBase64)
                if (friend == null) {
                    val fingerprint = CryptoUtils.computeFingerprint(packet.senderPublicKeyBase64)
                    friend = FriendEntity(
                        publicKeyBase64 = packet.senderPublicKeyBase64,
                        username = packet.senderUsername,
                        ipAddress = clientIp.ifBlank { packet.senderIp },
                        port = packet.senderPort,
                        fingerprint = fingerprint,
                        isOnline = true,
                        unreadCount = 1
                    )
                    friendDao.insertOrUpdateFriend(friend)
                } else {
                    friendDao.updateNetworkAddress(packet.senderPublicKeyBase64, clientIp.ifBlank { packet.senderIp }, packet.senderPort)
                    friendDao.updateOnlineStatus(packet.senderPublicKeyBase64, true)
                    friendDao.incrementUnreadCount(packet.senderPublicKeyBase64)
                }

                return P2pPacket(
                    type = "CHAT_ACK",
                    senderUsername = myAccount.username,
                    senderPublicKeyBase64 = myAccount.publicKeyBase64,
                    messageId = packet.messageId
                )
            }

            "PING" -> {
                if (packet.senderPublicKeyBase64.isNotBlank()) {
                    friendDao.updateOnlineStatus(packet.senderPublicKeyBase64, true)
                }
                return P2pPacket(
                    type = "PONG",
                    senderUsername = myAccount.username,
                    senderPublicKeyBase64 = myAccount.publicKeyBase64
                )
            }

            else -> return null
        }
    }

    suspend fun deleteFriend(friend: FriendEntity) = withContext(Dispatchers.IO) {
        messageDao.deleteMessagesForFriend(friend.publicKeyBase64)
        friendDao.deleteFriend(friend)
    }

    suspend fun updateFriendAddress(publicKeyBase64: String, newIp: String, newPort: Int) = withContext(Dispatchers.IO) {
        friendDao.updateNetworkAddress(publicKeyBase64, newIp, newPort)
    }

    suspend fun clearAllChats() = withContext(Dispatchers.IO) {
        messageDao.deleteAllMessages()
    }
}
