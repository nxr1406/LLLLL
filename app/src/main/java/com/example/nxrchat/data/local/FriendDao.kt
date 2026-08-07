package com.example.nxrchat.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface FriendDao {
    @Query("SELECT * FROM friends ORDER BY lastSeenTimestamp DESC")
    fun getAllFriends(): Flow<List<FriendEntity>>

    @Query("SELECT * FROM friends WHERE publicKeyBase64 = :publicKeyBase64 LIMIT 1")
    fun getFriendByPublicKey(publicKeyBase64: String): Flow<FriendEntity?>

    @Query("SELECT * FROM friends WHERE publicKeyBase64 = :publicKeyBase64 LIMIT 1")
    suspend fun getFriendByPublicKeyDirect(publicKeyBase64: String): FriendEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateFriend(friend: FriendEntity)

    @Update
    suspend fun updateFriend(friend: FriendEntity)

    @Delete
    suspend fun deleteFriend(friend: FriendEntity)

    @Query("UPDATE friends SET isOnline = :isOnline, lastSeenTimestamp = :timestamp WHERE publicKeyBase64 = :publicKeyBase64")
    suspend fun updateOnlineStatus(publicKeyBase64: String, isOnline: Boolean, timestamp: Long = System.currentTimeMillis())

    @Query("UPDATE friends SET unreadCount = 0 WHERE publicKeyBase64 = :publicKeyBase64")
    suspend fun clearUnreadCount(publicKeyBase64: String)

    @Query("UPDATE friends SET unreadCount = unreadCount + 1 WHERE publicKeyBase64 = :publicKeyBase64")
    suspend fun incrementUnreadCount(publicKeyBase64: String)

    @Query("UPDATE friends SET ipAddress = :ipAddress, port = :port WHERE publicKeyBase64 = :publicKeyBase64")
    suspend fun updateNetworkAddress(publicKeyBase64: String, ipAddress: String, port: Int)
}
