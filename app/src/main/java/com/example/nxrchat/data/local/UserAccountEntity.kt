package com.example.nxrchat.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_account")
data class UserAccountEntity(
    @PrimaryKey val id: Int = 1,
    val username: String,
    val publicKeyBase64: String,
    val privateKeyBase64: String,
    val fingerprint: String,
    val listenPort: Int = 8888,
    val autoAcceptFriends: Boolean = true
)
