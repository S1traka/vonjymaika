"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"

// Écrans d'authentification
import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen"

// Écrans principaux
import HomeScreen from "./screens/HomeScreen"
import MapScreen from "./screens/MapScreen"
import IncidentDetailsScreen from "./screens/IncidentDetailsScreen"
import ProfileScreen from "./screens/ProfileScreen"
import RewardsScreen from "./screens/RewardsScreen"
import TeamsScreen from "./screens/TeamsScreen"
import TeamDetailsScreen from "./screens/TeamDetailsScreen"
import SettingsScreen from "./screens/SettingsScreen"
import PaymentScreen from "./screens/PaymentScreen"

// Écran de chargement
import LoadingScreen from "./screens/LoadingScreen"

// Initialisation de Firebase
import { requestNotificationPermission } from "./firebase/firebaseConfig"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Navigateur d'onglets pour les écrans principaux
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else if (route.name === "Teams") {
            iconName = focused ? "people" : "people-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Accueil" }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: "Carte" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil" }} />
      <Tab.Screen name="Teams" component={TeamsScreen} options={{ title: "Équipes" }} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        setIsLoggedIn(!!token)
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de connexion:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Demander la permission pour les notifications
    const setupNotifications = async () => {
      await requestNotificationPermission()
    }

    checkLoginStatus()
    setupNotifications()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Écrans pour les utilisateurs connectés
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="IncidentDetails"
              component={IncidentDetailsScreen}
              options={{ headerShown: true, title: "Détails de l'incident" }}
            />
            <Stack.Screen
              name="TeamDetails"
              component={TeamDetailsScreen}
              options={{ headerShown: true, title: "Détails de l'équipe" }}
            />
            <Stack.Screen
              name="Rewards"
              component={RewardsScreen}
              options={{ headerShown: true, title: "Récompenses" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: true, title: "Paramètres" }}
            />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
          </>
        ) : (
          // Écrans d'authentification
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

