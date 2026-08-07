package com.example.nxrchat.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.nxrchat.data.ChatRepository
import com.example.nxrchat.data.local.FriendEntity
import com.example.nxrchat.data.local.MessageEntity
import com.example.nxrchat.data.local.UserAccountEntity
import com.example.nxrchat.util.NetworkUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    val repository = ChatRepository(application)

    val userAccount: StateFlow<UserAccountEntity?> = repository.userAccount
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    val friends: StateFlow<List<FriendEntity>> = repository.allFriends
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val isServerListening: StateFlow<Boolean> = repository.isServerListening

    private val _currentIp = MutableStateFlow(NetworkUtils.getLocalIpAddress())
    val currentIp: StateFlow<String> = _currentIp.asStateFlow()

    private val _isGeneratingKeys = MutableStateFlow(false)
    val isGeneratingKeys: StateFlow<Boolean> = _isGeneratingKeys.asStateFlow()

    private val _addFriendResult = MutableStateFlow<Result<FriendEntity>?>(null)
    val addFriendResult: StateFlow<Result<FriendEntity>?> = _addFriendResult.asStateFlow()

    private val _addFriendLoading = MutableStateFlow(false)
    val addFriendLoading: StateFlow<Boolean> = _addFriendLoading.asStateFlow()

    init {
        refreshLocalIp()
    }

    fun refreshLocalIp() {
        viewModelScope.launch {
            _currentIp.value = NetworkUtils.getLocalIpAddress()
        }
    }

    fun createAccount(username: String) {
        viewModelScope.launch {
            _isGeneratingKeys.value = true
            try {
                repository.createAccount(username)
            } finally {
                _isGeneratingKeys.value = false
            }
        }
    }

    fun connectAndAddFriend(
        ip: String,
        port: Int,
        name: String = "",
        publicKey: String = ""
    ) {
        viewModelScope.launch {
            _addFriendLoading.value = true
            _addFriendResult.value = null
            val result = repository.connectAndAddFriend(
                targetIp = ip.trim(),
                targetPort = port,
                customName = name.trim(),
                providedPublicKeyBase64 = publicKey.trim()
            )
            _addFriendResult.value = result
            _addFriendLoading.value = false
        }
    }

    fun resetAddFriendState() {
        _addFriendResult.value = null
        _addFriendLoading.value = false
    }

    fun sendMessage(friendPublicKeyBase64: String, text: String) {
        if (text.isBlank()) return
        viewModelScope.launch {
            repository.sendMessage(friendPublicKeyBase64, text)
        }
    }

    fun retrySendMessage(message: MessageEntity) {
        viewModelScope.launch {
            repository.retrySendMessage(message)
        }
    }

    fun clearUnreadCount(friendPublicKeyBase64: String) {
        viewModelScope.launch {
            repository.clearUnreadCount(friendPublicKeyBase64)
        }
    }

    fun updatePort(newPort: Int) {
        viewModelScope.launch {
            repository.updatePort(newPort)
        }
    }

    fun updateFriendAddress(publicKeyBase64: String, newIp: String, newPort: Int) {
        viewModelScope.launch {
            repository.updateFriendAddress(publicKeyBase64, newIp, newPort)
        }
    }

    fun deleteFriend(friend: FriendEntity) {
        viewModelScope.launch {
            repository.deleteFriend(friend)
        }
    }

    fun clearAllChats() {
        viewModelScope.launch {
            repository.clearAllChats()
        }
    }
}
