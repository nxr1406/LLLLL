package com.example.nxrchat.util

import android.content.Context
import android.net.Uri
import java.net.NetworkInterface
import java.net.Socket
import java.util.Collections

object NetworkUtils {

    /**
     * Finds active Wi-Fi or LAN IPv4 address of device.
     */
    fun getLocalIpAddress(): String {
        try {
            val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
            for (intf in interfaces) {
                // Ignore loopback and disabled interfaces
                if (intf.isLoopback || !intf.isUp) continue
                val addrs = Collections.list(intf.inetAddresses)
                for (addr in addrs) {
                    if (!addr.isLoopbackAddress) {
                        val sAddr = addr.hostAddress ?: continue
                        val isIPv4 = sAddr.indexOf(':') < 0
                        if (isIPv4 && sAddr != "127.0.0.1") {
                            return sAddr
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return "127.0.0.1"
    }

    /**
     * Builds a deep connection URI for QR codes or share links:
     * nxr://p2p?key=<public_key>&ip=<ip>&port=<port>&name=<name>
     */
    fun buildConnectionUri(
        publicKeyBase64: String,
        ipAddress: String,
        port: Int,
        username: String
    ): String {
        return Uri.Builder()
            .scheme("nxr")
            .authority("p2p")
            .appendQueryParameter("key", publicKeyBase64)
            .appendQueryParameter("ip", ipAddress)
            .appendQueryParameter("port", port.toString())
            .appendQueryParameter("name", username)
            .build()
            .toString()
    }

    /**
     * Parses a deep connection string/URI back into components.
     */
    data class ParsedPeerUri(
        val publicKeyBase64: String,
        val ipAddress: String,
        val port: Int,
        val username: String
    )

    fun parseConnectionUri(rawUriString: String): ParsedPeerUri? {
        return try {
            val uri = Uri.parse(rawUriString.trim())
            val key = uri.getQueryParameter("key")
            val ip = uri.getQueryParameter("ip") ?: ""
            val portStr = uri.getQueryParameter("port") ?: "8888"
            val name = uri.getQueryParameter("name") ?: "Peer"

            if (!key.isNullOrBlank()) {
                ParsedPeerUri(
                    publicKeyBase64 = key,
                    ipAddress = ip,
                    port = portStr.toIntOrNull() ?: 8888,
                    username = name
                )
            } else {
                null
            }
        } catch (e: Exception) {
            // Fallback: If user just pasted raw public key
            if (rawUriString.isNotBlank() && rawUriString.length > 20) {
                ParsedPeerUri(
                    publicKeyBase64 = rawUriString.trim(),
                    ipAddress = "",
                    port = 8888,
                    username = "NXR Peer"
                )
            } else {
                null
            }
        }
    }

    /**
     * Ping a target IP & Port to see if socket is open.
     */
    fun testConnection(ip: String, port: Int, timeoutMs: Int = 2000): Boolean {
        return try {
            Socket().use { socket ->
                socket.connect(java.net.InetSocketAddress(ip, port), timeoutMs)
                true
            }
        } catch (e: Exception) {
            false
        }
    }
}
