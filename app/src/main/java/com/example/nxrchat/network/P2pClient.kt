package com.example.nxrchat.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.InetSocketAddress
import java.net.Socket

object P2pClient {

    suspend fun sendPacket(
        targetIp: String,
        targetPort: Int,
        packet: P2pPacket,
        timeoutMs: Int = 4000
    ): Result<P2pPacket?> = withContext(Dispatchers.IO) {
        try {
            if (targetIp.isBlank()) {
                return@withContext Result.failure(IllegalArgumentException("IP address is missing"))
            }

            val socket = Socket()
            socket.connect(InetSocketAddress(targetIp, targetPort), timeoutMs)
            socket.soTimeout = timeoutMs

            val writer = PrintWriter(socket.getOutputStream(), true)
            val reader = BufferedReader(InputStreamReader(socket.getInputStream()))

            // Send payload line
            writer.println(packet.toJson())

            // Read response
            val responseLine = reader.readLine()
            socket.close()

            val responsePacket = responseLine?.let { P2pPacket.fromJson(it) }
            Result.success(responsePacket)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
