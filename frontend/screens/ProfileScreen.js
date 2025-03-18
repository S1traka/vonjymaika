"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [updatedUser, setUpdatedUser] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      // Charger les informations de l'utilisateur depuis le stockage local
      const userJson = await AsyncStorage.getItem("user")
      const token = await AsyncStorage.getItem("token")

      if (userJson && token) {
        const userData = JSON.parse(userJson)

        // Récupérer les informations complètes de l'utilisateur depuis l'API
        const response = await fetch(`${API_URL}/api/users/${userData.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors du chargement du profil")
        }

        setUser(data)
        setUpdatedUser(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error)
      Alert.alert("Erreur", "Impossible de charger votre profil")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const token = await AsyncStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: updatedUser.username,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour du profil")
      }

      // Mettre à jour les informations de l'utilisateur dans le stockage local
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          username: updatedUser.username,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
        }),
      )

      setUser(data)
      setEditing(false)
      Alert.alert("Succès", "Votre profil a été mis à jour avec succès")
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      Alert.alert("Erreur", "Impossible de mettre à jour votre profil")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnecter",
        onPress: async () => {
          try {
            // Supprimer les informations de l'utilisateur du stockage local
            await AsyncStorage.removeItem("token")
            await AsyncStorage.removeItem("user")

            // Rediriger vers l'écran de connexion
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          } catch (error) {
            console.error("Erreur lors de la déconnexion:", error)
            Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion")
          }
        },
        style: "destructive",
      },
    ])
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: "https://via.placeholder.com/150" }} style={styles.profileImage} />
          {!editing && (
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.username}>
          {editing ? (
            <TextInput
              style={styles.input}
              value={updatedUser.username}
              onChangeText={(text) => setUpdatedUser({ ...updatedUser, username: text })}
              placeholder="Nom d'utilisateur"
            />
          ) : (
            user?.username || "Utilisateur"
          )}
        </Text>

        <Text style={styles.role}>
          {user?.role === "admin" ? "Administrateur" : user?.role === "manager" ? "Gestionnaire" : "Utilisateur"}
        </Text>

        {!editing ? (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditing(false)
                setUpdatedUser(user)
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>{saving ? "Enregistrement..." : "Enregistrer"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#757575" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={updatedUser.email}
                onChangeText={(text) => setUpdatedUser({ ...updatedUser, email: text })}
                placeholder="Email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.email || "Non renseigné"}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={20} color="#757575" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={updatedUser.phone_number}
                onChangeText={(text) => setUpdatedUser({ ...updatedUser, phone_number: text })}
                placeholder="Numéro de téléphone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.phone_number || "Non renseigné"}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="card-outline" size={20} color="#757575" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Numéro CIN</Text>
            <Text style={styles.infoValue}>{user?.cin_number || "Non renseigné"}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={20} color="#757575" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Membre depuis</Text>
            <Text style={styles.infoValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Inconnu"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("Rewards")}>
          <Ionicons name="trophy-outline" size={24} color="#2E7D32" style={styles.actionIcon} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Mes récompenses</Text>
            <Text style={styles.actionDescription}>Voir toutes vos récompenses et badges</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="#2E7D32" style={styles.actionIcon} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Paramètres</Text>
            <Text style={styles.actionDescription}>Gérer vos préférences et notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#D32F2F" style={styles.actionIcon} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, styles.logoutText]}>Déconnexion</Text>
            <Text style={styles.actionDescription}>Se déconnecter de l'application</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#757575",
  },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2E7D32",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#424242",
  },
  role: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 15,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
  },
  editActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  saveButton: {
    backgroundColor: "#2E7D32",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  cancelButtonText: {
    color: "#424242",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: "#424242",
  },
  input: {
    fontSize: 16,
    color: "#424242",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  actionIcon: {
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#424242",
  },
  actionDescription: {
    fontSize: 14,
    color: "#757575",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#D32F2F",
  },
})

export default ProfileScreen

