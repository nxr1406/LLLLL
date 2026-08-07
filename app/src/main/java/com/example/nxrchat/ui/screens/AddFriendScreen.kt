package com.example.nxrchat.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentPaste
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Router
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.nxrchat.data.local.FriendEntity
import com.example.nxrchat.util.NetworkUtils
import com.example.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddFriendScreen(
    addFriendResult: Result<FriendEntity>?,
    isLoading: Boolean,
    onBackClick: () -> Unit,
    onConnectAndAdd: (ip: String, port: Int, name: String, publicKey: String) -> Unit,
    onResetResult: () -> Unit
) {
    val clipboardManager = LocalClipboardManager.current

    var targetIp by remember { mutableStateOf("") }
    var targetPortText by remember { mutableStateOf("8888") }
    var customName by remember { mutableStateOf("") }
    var rawPublicKeyOrUri by remember { mutableStateOf("") }
    var validationError by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        onResetResult()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add Peer / Friend") },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier.testTag("back_button")
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Quick Paste URI Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.QrCode,
                            contentDescription = null,
                            tint = TealPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Paste Peer URI / Connection String",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = rawPublicKeyOrUri,
                        onValueChange = { input ->
                            rawPublicKeyOrUri = input
                            val parsed = NetworkUtils.parseConnectionUri(input)
                            if (parsed != null) {
                                if (parsed.ipAddress.isNotBlank()) targetIp = parsed.ipAddress
                                targetPortText = parsed.port.toString()
                                if (parsed.username.isNotBlank()) customName = parsed.username
                            }
                        },
                        placeholder = { Text("nxr://p2p?key=...&ip=192.168.1.50&port=8888") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("paste_uri_field"),
                        singleLine = true,
                        trailingIcon = {
                            IconButton(onClick = {
                                val clipText = clipboardManager.getText()?.text
                                if (!clipText.isNullOrBlank()) {
                                    rawPublicKeyOrUri = clipText
                                    val parsed = NetworkUtils.parseConnectionUri(clipText)
                                    if (parsed != null) {
                                        if (parsed.ipAddress.isNotBlank()) targetIp = parsed.ipAddress
                                        targetPortText = parsed.port.toString()
                                        if (parsed.username.isNotBlank()) customName = parsed.username
                                    }
                                }
                            }) {
                                Icon(Icons.Default.ContentPaste, contentDescription = "Paste Clipboard")
                            }
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Manual Connection Details",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(12.dp))

            // IP Address
            OutlinedTextField(
                value = targetIp,
                onValueChange = {
                    targetIp = it
                    validationError = ""
                },
                label = { Text("Peer Wi-Fi IP Address") },
                placeholder = { Text("192.168.1.100") },
                leadingIcon = { Icon(Icons.Default.Router, contentDescription = null) },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("peer_ip_input"),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth()
            ) {
                // Port
                OutlinedTextField(
                    value = targetPortText,
                    onValueChange = { targetPortText = it },
                    label = { Text("Port") },
                    singleLine = true,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("peer_port_input")
                )

                Spacer(modifier = Modifier.width(12.dp))

                // Custom Name
                OutlinedTextField(
                    value = customName,
                    onValueChange = { customName = it },
                    label = { Text("Peer Name (Optional)") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    singleLine = true,
                    modifier = Modifier
                        .weight(2f)
                        .testTag("peer_name_input")
                )
            }

            AnimatedVisibility(visible = validationError.isNotEmpty()) {
                Text(
                    text = validationError,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Connect & Add Button
            Button(
                onClick = {
                    val port = targetPortText.toIntOrNull() ?: 8888
                    val parsed = NetworkUtils.parseConnectionUri(rawPublicKeyOrUri)
                    val keyToUse = parsed?.publicKeyBase64 ?: rawPublicKeyOrUri.trim()

                    if (targetIp.isBlank()) {
                        validationError = "Please enter peer IP address"
                    } else {
                        validationError = ""
                        onConnectAndAdd(targetIp.trim(), port, customName.trim(), keyToUse)
                    }
                },
                enabled = !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("connect_add_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TealPrimary
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Testing P2P Handshake...")
                } else {
                    Icon(Icons.Default.PersonAdd, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Connect & Add Friend", fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Connection Result Alert
            addFriendResult?.let { result ->
                if (result.isSuccess) {
                    val friend = result.getOrNull()
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = TealPrimary,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Peer Connected Successfully!",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                                Text(
                                    text = "${friend?.username} (${friend?.fingerprint}) is ready for E2EE messaging.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                        }
                    }
                } else {
                    val errorMsg = result.exceptionOrNull()?.message ?: "Handshake failed"
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Error,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Connection Notice",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                                Text(
                                    text = "$errorMsg. Make sure both devices are on the same Wi-Fi network and NXR Chat is open on peer device.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // How P2P Works Guide
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = null,
                            tint = TealPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "How P2P Local Messaging Works",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "• Both devices must connect to the same Wi-Fi router or Mobile Hotspot.\n" +
                                "• Messages travel directly device-to-device over encrypted TCP sockets.\n" +
                                "• Check 'My Profile / ID' tab to see your local Wi-Fi IP address.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
