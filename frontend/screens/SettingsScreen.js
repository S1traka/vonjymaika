"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    darkMode: false,
    offlineMode: false,
    emergencyContacts: true,
    dataSync: true,
    language: "Français",
  })

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    try {
      // Charger les informations de l'utilisateur
      const userJson = await AsyncStorage.getItem("user")
      if (userJson) {
        setUser(JSON.parse(userJson))
      }

      // Charger les paramètres depuis le stockage local
      const savedSettings = await AsyncStorage.getItem("userSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error)
    }
  }

  const handleToggleSetting = async (key) => {
    try {
      const newSettings = {
        ...settings,
        [key]: !settings[key],
      }

      setSettings(newSettings)

      // Sauvegarder les paramètres dans le stockage local
      await AsyncStorage.setItem("userSettings", JSON.stringify(newSettings))
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error)
      Alert.alert("Erreur", "Impossible de sauvegarder les paramètres")
    }
  }

  const handleLanguageChange = () => {
    Alert.alert("Changer de langue", "Cette fonctionnalité sera disponible prochainement.", [{ text: "OK" }])
  }

  const handleClearCache = () => {
    Alert.alert(
      "Vider le cache",
      "Êtes-vous sûr de vouloir vider le cache de l'application ? Cela supprimera les données temporaires mais pas vos informations de compte.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Vider",
          onPress: async () => {
            try {
              // Simuler le nettoyage du cache
              await new Promise((resolve) => setTimeout(resolve, 1000))
              Alert.alert("Succès", "Le cache a été vidé avec succès.")
            } catch (error) {
              console.error("Erreur:", error)
              Alert.alert("Erreur", "Impossible de vider le cache")
            }
          },
          style: "destructive",
        },
      ],
    )
  }

  const handleAbout = () => {
    Alert.alert(
      "À propos de VonjyMaika",
      "VonjyMaika est une application de gestion des urgences pour la région d'Analamanga à Madagascar. Version 1.0.0",
      [{ text: "OK" }],
    )
  }

  const handlePrivacyPolicy = () => {
    Alert.alert("Politique de confidentialité", "Cette fonctionnalité sera disponible prochainement.", [{ text: "OK" }])
  }

  const handleTermsOfService = () => {
    Alert.alert("Conditions d'utilisation", "Cette fonctionnalité sera disponible prochainement.", [{ text: "OK" }])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notifications push</Text>
            <Text style={styles.settingDescription}>Recevoir des alertes pour les incidents à proximité</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={() => handleToggleSetting("notifications")}
            trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
            thumbColor={settings.notifications ? "#2E7D32" : "#BDBDBD"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Contacts d'urgence</Text>
            <Text style={styles.settingDescription}>Alerter vos contacts en cas d'urgence</Text>
          </View>
          <Switch
            value={settings.emergencyContacts}
            onValueChange={() => handleToggleSetting("emergencyContacts")}
            trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
            thumbColor={settings.emergencyContacts ? "#2E7D32" : "#BDBDBD"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidentialité</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Suivi de localisation</Text>
            <Text style={styles.settingDescription}>Permettre à l'application de suivre votre position</Text>
          </View>
          <Switch
            value={settings.locationTracking}
            onValueChange={() => handleToggleSetting("locationTracking")}
            trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
            thumbColor={settings.locationTracking ? "#2E7D32" : "#BDBDBD"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apparence</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Mode sombre</Text>
            <Text style={styles.settingDescription}>Changer l'apparence de l'application</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={() => handleToggleSetting("darkMode")}
            trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
            thumbColor={settings.darkMode ? "#2E7D32" : "#BDBDBD"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Données</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Mode hors ligne</Text>
            <Text style={styles.settingDescription}>Utiliser l'application sans connexion internet</Text>
          </View>
          <Switch
            value={settings.offlineMode}
            onValueChange={() => handleToggleSetting("offlineMode")}
            trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
            thumbColor={settings.offlineMode ? "#2E7D32" : "#BDBDBD"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Synchronisation des données</Text>
            <Text style={styles.settingDescription}>Synchroniser automatiquement les données</Text>
          </View>
          <Switch
            value={settings.dataSync}
            onValueChange={() => handleToggleSetting("dataSync")}
            trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
            thumbColor={settings.dataSync ? "#2E7D32" : "#BDBDBD"}
          />
        </View>

        <TouchableOpacity style={styles.actionItem} onPress={handleClearCache}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Vider le cache</Text>
            <Text style={styles.actionDescription}>Supprimer les données temporaires</Text>
          </View>
          <Ionicons name="trash-outline" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>

        <TouchableOpacity style={styles.actionItem} onPress={handleLanguageChange}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Langue</Text>
            <Text style={styles.actionDescription}>{settings.language}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>

        <TouchableOpacity style={styles.actionItem} onPress={handleAbout}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>À propos de VonjyMaika</Text>
            <Text style={styles.actionDescription}>Informations sur l'application</Text>
          </View>
          <Ionicons name="information-circle-outline" size={24} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handlePrivacyPolicy}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Politique de confidentialité</Text>
            <Text style={styles.actionDescription}>Comment nous utilisons vos données</Text>
          </View>
          <Ionicons name="shield-outline" size={24} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleTermsOfService}>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Conditions d'utilisation</Text>
            <Text style={styles.actionDescription}>Termes et conditions</Text>
          </View>
          <Ionicons name="document-text-outline" size={24} color="#757575" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    backgroundColor: "#fff",
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginVertical: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    color: "#424242",
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: "#757575",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  actionInfo: {
    flex: 1,
    marginRight: 10,
  },
  actionTitle: {
    fontSize: 16,
    color: "#424242",
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 14,
    color: "#757575",
  },
})

export default SettingsScreen

