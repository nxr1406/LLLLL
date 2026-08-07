package com.example.nxrchat.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val friendPublicKeyBase64: String,
    val senderPublicKeyBase64: String,
    val messageText: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isFromMe: Boolean,
    val status: String = "SENT" // "SENDING", "SENT", "DELIVERED", "FAILED"
)
