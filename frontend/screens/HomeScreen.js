"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [recentRewards, setRecentRewards] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger les informations de l'utilisateur
      const userJson = await AsyncStorage.getItem("user")
      if (userJson) {
        setUser(JSON.parse(userJson))
      }

      // Charger les incidents récents
      await loadRecentIncidents()

      // Charger les récompenses récentes
      await loadRecentRewards()
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      Alert.alert("Erreur", "Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  const loadRecentIncidents = async () => {
    try {
      const token = await AsyncStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/incidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du chargement des incidents")
      }

      // Limiter aux 5 incidents les plus récents
      setIncidents(data.slice(0, 5))
    } catch (error) {
      console.error("Erreur:", error)
      throw error
    }
  }

  const loadRecentRewards = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userId = user ? user.id : null

      if (!userId) return

      const response = await fetch(`${API_URL}/api/rewards/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du chargement des récompenses")
      }

      // Limiter aux 3 récompenses les plus récentes
      setRecentRewards(data.slice(0, 3))
    } catch (error) {
      console.error("Erreur:", error)
      throw error
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadData()
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleIncidentPress = (incident) => {
    navigation.navigate("IncidentDetails", { incident })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#F44336"
      case "in_progress":
        return "#FFC107"
      case "resolved":
        return "#4CAF50"
      default:
        return "#757575"
    }
  }

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case "low":
        return "Faible"
      case "medium":
        return "Moyen"
      case "high":
        return "Élevé"
      default:
        return severity
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "#4CAF50"
      case "medium":
        return "#FFC107"
      case "high":
        return "#F44336"
      default:
        return "#757575"
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2E7D32"]} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user ? user.username : "Utilisateur"}</Text>
          <Text style={styles.subtitle}>Bienvenue sur VonjyMaika</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="#424242" />
        </TouchableOpacity>
      </View>

      <View style={styles.emergencyButtonContainer}>
        <TouchableOpacity style={styles.emergencyButton} onPress={() => navigation.navigate("Map")}>
          <Ionicons name="warning" size={32} color="#fff" />
          <Text style={styles.emergencyButtonText}>Signaler une urgence</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incidents récents</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Map")}>
            <Text style={styles.seeAllText}>Voir tous</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des incidents...</Text>
          </View>
        ) : incidents.length > 0 ? (
          incidents.map((incident) => (
            <TouchableOpacity
              key={incident.id}
              style={styles.incidentCard}
              onPress={() => handleIncidentPress(incident)}
            >
              <View style={styles.incidentHeader}>
                <Text style={styles.incidentTitle}>{incident.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                  <Text style={styles.statusText}>
                    {incident.status === "active" ? "Actif" : incident.status === "in_progress" ? "En cours" : "Résolu"}
                  </Text>
                </View>
              </View>

              <Text style={styles.incidentDescription} numberOfLines={2}>
                {incident.description || "Aucune description disponible"}
              </Text>

              <View style={styles.incidentFooter}>
                <View style={styles.incidentMeta}>
                  <Ionicons name="person-outline" size={14} color="#757575" />
                  <Text style={styles.incidentMetaText}>{incident.reporter_name || "Anonyme"}</Text>
                </View>

                <View style={styles.incidentMeta}>
                  <Ionicons name="time-outline" size={14} color="#757575" />
                  <Text style={styles.incidentMetaText}>{new Date(incident.created_at).toLocaleDateString()}</Text>
                </View>

                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                  <Text style={styles.severityText}>{getSeverityLabel(incident.severity)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun incident récent</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos récompenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Rewards")}>
            <Text style={styles.seeAllText}>Voir toutes</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des récompenses...</Text>
          </View>
        ) : recentRewards.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsContainer}>
            {recentRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <Image
                  source={{ uri: reward.badge_image_url || "https://via.placeholder.com/100" }}
                  style={styles.rewardImage}
                />
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardPoints}>{reward.points} points</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune récompense récente</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Map")}>
              <Text style={styles.actionButtonText}>Commencer à signaler</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Conseils de sécurité</Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" style={styles.tipIcon} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Préparez un kit d'urgence</Text>
            <Text style={styles.tipText}>
              Gardez un kit d'urgence contenant de l'eau, de la nourriture non périssable, une trousse de premiers soins
              et une lampe de poche.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="flash" size={24} color="#FFC107" style={styles.tipIcon} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>En cas d'inondation</Text>
            <Text style={styles.tipText}>
              Évacuez vers un terrain plus élevé et évitez de marcher ou de conduire dans les eaux de crue.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    marginTop: 5,
  },
  settingsButton: {
    padding: 10,
  },
  emergencyButtonContainer: {
    padding: 20,
  },
  emergencyButton: {
    backgroundColor: "#D32F2F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  emergencyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
  },
  seeAllText: {
    color: "#2E7D32",
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#757575",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#757575",
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  incidentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#424242",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  incidentDescription: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 10,
  },
  incidentFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  incidentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  incidentMetaText: {
    fontSize: 12,
    color: "#757575",
    marginLeft: 3,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: "auto",
  },
  severityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  rewardsContainer: {
    flexDirection: "row",
  },
  rewardCard: {
    alignItems: "center",
    marginRight: 15,
    width: 100,
  },
  rewardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#424242",
    textAlign: "center",
  },
  rewardPoints: {
    fontSize: 12,
    color: "#757575",
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tipIcon: {
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: "#757575",
  },
})

export default HomeScreen

