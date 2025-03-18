"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"

const TeamDetailsScreen = ({ route, navigation }) => {
  const { team } = route.params
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isManager, setIsManager] = useState(false)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      // Charger les informations de l'utilisateur
      const userJson = await AsyncStorage.getItem("user")
      const token = await AsyncStorage.getItem("token")

      if (userJson && token) {
        const userData = JSON.parse(userJson)
        setUser(userData)

        // Vérifier si l'utilisateur est admin ou manager
        setIsManager(userData.role === "admin" || userData.role === "manager")

        // Récupérer les membres de l'équipe
        const response = await fetch(`${API_URL}/api/teams/${team.id}/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors du chargement des membres")
        }

        setMembers(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des membres:", error)
      Alert.alert("Erreur", "Impossible de charger les membres de l'équipe")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = () => {
    if (isManager) {
      Alert.alert("Fonctionnalité à venir", "L'ajout de membres sera disponible prochainement.")
    } else {
      Alert.alert("Accès refusé", "Vous n'avez pas les droits nécessaires pour ajouter des membres.")
    }
  }

  const handleRemoveMember = (memberId) => {
    if (!isManager) {
      Alert.alert("Accès refusé", "Vous n'avez pas les droits nécessaires pour supprimer des membres.")
      return
    }

    Alert.alert("Confirmer la suppression", "Êtes-vous sûr de vouloir retirer ce membre de l'équipe ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token")

            const response = await fetch(`${API_URL}/api/teams/${team.id}/members/${memberId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.message || "Erreur lors de la suppression du membre")
            }

            // Recharger la liste des membres
            loadTeamMembers()
            Alert.alert("Succès", "Le membre a été retiré de l'équipe")
          } catch (error) {
            console.error("Erreur:", error)
            Alert.alert("Erreur", "Impossible de supprimer le membre")
          }
        },
        style: "destructive",
      },
    ])
  }

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={[styles.memberAvatar, item.role === "leader" ? styles.leaderAvatar : null]}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{item.username}</Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <Text style={styles.memberPhone}>{item.phone_number}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.role === "leader" ? "Chef d'équipe" : "Membre"}</Text>
          </View>
        </View>
      </View>

      {isManager && (
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveMember(item.user_id)}>
          <Ionicons name="close-circle" size={24} color="#D32F2F" />
        </TouchableOpacity>
      )}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Chargement des membres...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.teamHeader}>
        <View style={styles.teamIcon}>
          <Ionicons name="people" size={32} color="#fff" />
        </View>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamCompany}>Entreprise ID: {team.company_id}</Text>
        <Text style={styles.teamCreated}>Créée le {new Date(team.created_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>Membres de l'équipe</Text>
        {isManager && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>

      {members.length > 0 ? (
        <FlatList
          data={members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.membersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Aucun membre dans cette équipe</Text>
          <Text style={styles.emptyText}>
            {isManager
              ? 'Ajoutez des membres à cette équipe en appuyant sur le bouton "Ajouter".'
              : "Cette équipe n'a pas encore de membres."}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#757575",
  },
  teamHeader: {
    backgroundColor: "#2E7D32",
    padding: 20,
    alignItems: "center",
  },
  teamIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  teamName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  teamCompany: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  teamCreated: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  membersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
  membersList: {
    padding: 15,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: "row",
    flex: 1,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#757575",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  leaderAvatar: {
    backgroundColor: "#FFC107",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 3,
  },
  memberEmail: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 3,
  },
  memberPhone: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 5,
  },
  roleBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    color: "#424242",
  },
  removeButton: {
    padding: 5,
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

export default TeamDetailsScreen

