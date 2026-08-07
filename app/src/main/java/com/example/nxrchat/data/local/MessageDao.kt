package com.example.nxrchat.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface MessageDao {
    @Query("SELECT * FROM messages WHERE friendPublicKeyBase64 = :friendPublicKeyBase64 ORDER BY timestamp ASC")
    fun getMessagesForFriend(friendPublicKeyBase64: String): Flow<List<MessageEntity>>

    @Query("SELECT * FROM messages WHERE friendPublicKeyBase64 = :friendPublicKeyBase64 ORDER BY timestamp DESC LIMIT 1")
    fun getLatestMessageForFriend(friendPublicKeyBase64: String): Flow<MessageEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageEntity): Long

    @Update
    suspend fun updateMessage(message: MessageEntity)

    @Query("UPDATE messages SET status = :status WHERE id = :messageId")
    suspend fun updateMessageStatus(messageId: Long, status: String)

    @Query("DELETE FROM messages WHERE friendPublicKeyBase64 = :friendPublicKeyBase64")
    suspend fun deleteMessagesForFriend(friendPublicKeyBase64: String)

    @Query("DELETE FROM messages")
    suspend fun deleteAllMessages()
}
