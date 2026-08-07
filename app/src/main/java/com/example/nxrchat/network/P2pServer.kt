package com.example.nxrchat.network

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket

class P2pServer(
    private val onPacketReceived: suspend (incomingPacket: P2pPacket, clientIp: String) -> P2pPacket?
) {
    private var serverSocket: ServerSocket? = null
    private var serverJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.IO)

    private val _isListening = MutableStateFlow(false)
    val isListening: StateFlow<Boolean> = _isListening.asStateFlow()

    private val _currentPort = MutableStateFlow(8888)
    val currentPort: StateFlow<Int> = _currentPort.asStateFlow()

    fun startServer(port: Int = 8888) {
        if (_isListening.value && _currentPort.value == port) return

        stopServer()

        serverJob = scope.launch {
            try {
                _currentPort.value = port
                val ss = ServerSocket(port)
                serverSocket = ss
                _isListening.value = true
                Log.d("P2pServer", "Server started on port $port")

                while (_isListening.value && !ss.isClosed) {
                    try {
                        val clientSocket: Socket = ss.accept()
                        launch {
                            handleClient(clientSocket)
                        }
                    } catch (e: Exception) {
                        if (!_isListening.value || ss.isClosed) break
                        Log.e("P2pServer", "Error accepting connection: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e("P2pServer", "Failed to start ServerSocket on port $port: ${e.message}")
                _isListening.value = false
            }
        }
    }

    private suspend fun handleClient(socket: Socket) {
        try {
            socket.soTimeout = 5000
            val clientIp = socket.inetAddress.hostAddress ?: ""
            val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
            val writer = PrintWriter(socket.getOutputStream(), true)

            val inputLine = reader.readLine()
            if (!inputLine.isNullOrBlank()) {
                val incomingPacket = P2pPacket.fromJson(inputLine)
                if (incomingPacket != null) {
                    val responsePacket = onPacketReceived(incomingPacket, clientIp)
                    if (responsePacket != null) {
                        writer.println(responsePacket.toJson())
                    } else {
                        // Default ACK
                        val defaultAck = P2pPacket(
                            type = "ACK",
                            senderUsername = "NXR Node",
                            senderPublicKeyBase64 = ""
                        )
                        writer.println(defaultAck.toJson())
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("P2pServer", "Client handling error: ${e.message}")
        } finally {
            try {
                socket.close()
            } catch (_: Exception) {}
        }
    }

    fun stopServer() {
        _isListening.value = false
        try {
            serverSocket?.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        serverSocket = null
        serverJob?.cancel()
        serverJob = null
    }
}
