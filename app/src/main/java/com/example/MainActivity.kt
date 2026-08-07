package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.nxrchat.ui.screens.AddFriendScreen
import com.example.nxrchat.ui.screens.ChatScreen
import com.example.nxrchat.ui.screens.CreateAccountScreen
import com.example.nxrchat.ui.screens.HomeScreen
import com.example.nxrchat.ui.screens.ProfileScreen
import com.example.nxrchat.ui.screens.SettingsScreen
import com.example.nxrchat.ui.viewmodel.MainViewModel
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.TealPrimary
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

class MainActivity : ComponentActivity() {

    private val mainViewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                NxrChatApp(viewModel = mainViewModel)
            }
        }
    }
}

@Composable
fun NxrChatApp(viewModel: MainViewModel) {
    val navController = rememberNavController()
    val userAccount by viewModel.userAccount.collectAsState()
    val friends by viewModel.friends.collectAsState()
    val currentIp by viewModel.currentIp.collectAsState()
    val isServerListening by viewModel.isServerListening.collectAsState()
    val isGeneratingKeys by viewModel.isGeneratingKeys.collectAsState()
    val addFriendResult by viewModel.addFriendResult.collectAsState()
    val addFriendLoading by viewModel.addFriendLoading.collectAsState()

    // Determine initial destination: If account created -> Home, else CreateAccount
    val startDestination = if (userAccount != null) "home" else "create_account"

    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = Modifier.fillMaxSize()
    ) {
        // 1. Create Account Screen
        composable("create_account") {
            CreateAccountScreen(
                isGeneratingKeys = isGeneratingKeys,
                onCreateAccount = { username ->
                    viewModel.createAccount(username)
                }
            )
            // Automatically transition to home once account is created
            if (userAccount != null) {
                navController.navigate("home") {
                    popUpTo("create_account") { inclusive = true }
                }
            }
        }

        // 2. Home / Chat List Screen
        composable("home") {
            HomeScreen(
                userAccount = userAccount,
                friends = friends,
                currentIp = currentIp,
                isServerListening = isServerListening,
                onRefreshIp = { viewModel.refreshLocalIp() },
                onSelectFriend = { friend ->
                    val encodedKey = URLEncoder.encode(friend.publicKeyBase64, StandardCharsets.UTF_8.toString())
                    navController.navigate("chat/$encodedKey")
                },
                onAddFriendClick = { navController.navigate("add_friend") },
                bottomBar = { BottomNavigationBar(navController) }
            )
        }

        // 3. Add Friend Screen
        composable("add_friend") {
            AddFriendScreen(
                addFriendResult = addFriendResult,
                isLoading = addFriendLoading,
                onBackClick = { navController.popBackStack() },
                onConnectAndAdd = { ip, port, name, publicKey ->
                    viewModel.connectAndAddFriend(ip, port, name, publicKey)
                },
                onResetResult = { viewModel.resetAddFriendState() }
            )
        }

        // 4. Chat Screen
        composable(
            route = "chat/{friendPublicKey}",
            arguments = listOf(navArgument("friendPublicKey") { type = NavType.StringType })
        ) { backStackEntry ->
            val encodedKey = backStackEntry.arguments?.getString("friendPublicKey") ?: ""
            val decodedKey = URLDecoder.decode(encodedKey, StandardCharsets.UTF_8.toString())

            ChatScreen(
                friendPublicKeyBase64 = decodedKey,
                viewModel = viewModel,
                onBackClick = { navController.popBackStack() }
            )
        }

        // 5. Profile / My ID Screen
        composable("profile") {
            ProfileScreen(
                userAccount = userAccount,
                currentIp = currentIp,
                bottomBar = { BottomNavigationBar(navController) }
            )
        }

        // 6. Settings Screen
        composable("settings") {
            SettingsScreen(
                userAccount = userAccount,
                currentIp = currentIp,
                isServerListening = isServerListening,
                onUpdatePort = { port -> viewModel.updatePort(port) },
                onClearAllChats = { viewModel.clearAllChats() },
                bottomBar = { BottomNavigationBar(navController) }
            )
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(
        containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surface,
        contentColor = TealPrimary
    ) {
        NavigationBarItem(
            icon = { Icon(Icons.Default.Chat, contentDescription = "Chats") },
            label = { Text("Chats") },
            selected = currentRoute == "home",
            onClick = {
                if (currentRoute != "home") {
                    navController.navigate("home") {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = TealPrimary.copy(alpha = 0.15f)
            ),
            modifier = Modifier.testTag("nav_chats")
        )

        NavigationBarItem(
            icon = { Icon(Icons.Default.Person, contentDescription = "My ID") },
            label = { Text("My ID") },
            selected = currentRoute == "profile",
            onClick = {
                if (currentRoute != "profile") {
                    navController.navigate("profile") {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = TealPrimary.copy(alpha = 0.15f)
            ),
            modifier = Modifier.testTag("nav_profile")
        )

        NavigationBarItem(
            icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
            label = { Text("Settings") },
            selected = currentRoute == "settings",
            onClick = {
                if (currentRoute != "settings") {
                    navController.navigate("settings") {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = TealPrimary.copy(alpha = 0.15f)
            ),
            modifier = Modifier.testTag("nav_settings")
        )
    }
}
