package com.example.nxrchat.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "friends")
data class FriendEntity(
    @PrimaryKey val publicKeyBase64: String,
    val username: String,
    val ipAddress: String,
    val port: Int = 8888,
    val fingerprint: String,
    val lastSeenTimestamp: Long = System.currentTimeMillis(),
    val isOnline: Boolean = false,
    val unreadCount: Int = 0
)
