package com.example.nxrchat.network

import org.json.JSONObject

data class P2pPacket(
    val type: String, // HANDSHAKE, HANDSHAKE_ACK, CHAT, CHAT_ACK, PING, PONG
    val senderUsername: String,
    val senderPublicKeyBase64: String,
    val senderIp: String = "",
    val senderPort: Int = 8888,
    val payload: String = "", // Encrypted message payload JSON for CHAT, or extra info
    val messageId: Long = 0,
    val timestamp: Long = System.currentTimeMillis()
) {
    fun toJson(): String {
        val json = JSONObject()
        json.put("type", type)
        json.put("senderUsername", senderUsername)
        json.put("senderPublicKeyBase64", senderPublicKeyBase64)
        json.put("senderIp", senderIp)
        json.put("senderPort", senderPort)
        json.put("payload", payload)
        json.put("messageId", messageId)
        json.put("timestamp", timestamp)
        return json.toString()
    }

    companion object {
        fun fromJson(jsonStr: String): P2pPacket? {
            return try {
                val json = JSONObject(jsonStr)
                P2pPacket(
                    type = json.getString("type"),
                    senderUsername = json.optString("senderUsername", "Peer"),
                    senderPublicKeyBase64 = json.getString("senderPublicKeyBase64"),
                    senderIp = json.optString("senderIp", ""),
                    senderPort = json.optInt("senderPort", 8888),
                    payload = json.optString("payload", ""),
                    messageId = json.optLong("messageId", 0L),
                    timestamp = json.optLong("timestamp", System.currentTimeMillis())
                )
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}
