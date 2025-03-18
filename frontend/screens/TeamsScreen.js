"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"

const TeamsScreen = ({ navigation }) => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      // Charger les informations de l'utilisateur
      const userJson = await AsyncStorage.getItem("user")
      const token = await AsyncStorage.getItem("token")

      if (userJson && token) {
        const userData = JSON.parse(userJson)
        setUser(userData)

        // Récupérer les équipes
        const response = await fetch(`${API_URL}/api/teams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors du chargement des équipes")
        }

        setTeams(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des équipes:", error)
      Alert.alert("Erreur", "Impossible de charger les équipes")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadTeams()
  }

  const handleTeamPress = (team) => {
    navigation.navigate("TeamDetails", { team })
  }

  const handleCreateTeam = () => {
    // Vérifier si l'utilisateur a les droits pour créer une équipe
    if (user && (user.role === "admin" || user.role === "manager")) {
      // Naviguer vers l'écran de création d'équipe
      Alert.alert("Fonctionnalité à venir", "La création d'équipe sera disponible prochainement.")
    } else {
      Alert.alert("Accès refusé", "Vous n'avez pas les droits nécessaires pour créer une équipe.")
    }
  }

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity style={styles.teamCard} onPress={() => handleTeamPress(item)}>
      <View style={styles.teamHeader}>
        <View style={styles.teamIcon}>
          <Ionicons name="people" size={24} color="#fff" />
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <Text style={styles.teamCompany}>Entreprise ID: {item.company_id}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#757575" />
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Chargement des équipes...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Équipes</Text>
        {user && (user.role === "admin" || user.role === "manager") && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateTeam}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {teams.length > 0 ? (
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.teamsList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Aucune équipe disponible</Text>
          <Text style={styles.emptyText}>
            {user && (user.role === "admin" || user.role === "manager")
              ? 'Vous pouvez créer une nouvelle équipe en appuyant sur le bouton "+" en haut à droite.'
              : "Vous n'êtes pas encore membre d'une équipe. Contactez votre administrateur pour plus d'informations."}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#757575",
  },
  teamsList: {
    padding: 15,
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    overflow: "hidden",
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 5,
  },
  teamCompany: {
    fontSize: 14,
    color: "#757575",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#424242",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
})

export default TeamsScreen

