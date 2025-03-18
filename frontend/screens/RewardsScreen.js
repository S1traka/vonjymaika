"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import RewardService, { BADGES } from "../services/rewardService"

const RewardsScreen = ({ navigation }) => {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [activeTab, setActiveTab] = useState("rewards") // 'rewards' ou 'leaderboard'

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Charger les informations de l'utilisateur
      const userJson = await AsyncStorage.getItem("user")
      if (userJson) {
        const userData = JSON.parse(userJson)
        setUser(userData)

        // Charger les récompenses de l'utilisateur
        const userRewards = await RewardService.getUserRewards(userData.id)
        setRewards(userRewards)

        // Charger le classement
        const leaderboardData = await RewardService.getLeaderboard()
        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      Alert.alert("Erreur", "Impossible de charger vos récompenses")
    } finally {
      setLoading(false)
    }
  }

  const renderRewardItem = ({ item }) => (
    <View style={styles.rewardCard}>
      <Image source={{ uri: item.badge_image_url || "https://via.placeholder.com/100" }} style={styles.rewardImage} />
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardDescription}>{item.description}</Text>
        <View style={styles.rewardMeta}>
          <Ionicons name="trophy" size={16} color="#FFC107" />
          <Text style={styles.rewardPoints}>{item.points} points</Text>
          <Text style={styles.rewardDate}>Obtenu le {new Date(item.earned_at).toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  )

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.leaderboardRank}>{index + 1}</Text>
      <View style={styles.leaderboardUser}>
        <View style={styles.leaderboardAvatar}>
          <Text style={styles.leaderboardAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.leaderboardUsername}>{item.username}</Text>
      </View>
      <Text style={styles.leaderboardPoints}>{item.total_points} pts</Text>
    </View>
  )

  const renderAvailableBadges = () => {
    // Filtrer les badges que l'utilisateur n'a pas encore
    const userBadgeIds = rewards.map((reward) => reward.badge_id)
    const availableBadges = BADGES.filter((badge) => !userBadgeIds.includes(badge.id))

    return (
      <View style={styles.availableBadgesContainer}>
        <Text style={styles.sectionTitle}>Badges à débloquer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableBadges.map((badge) => (
            <View key={badge.id} style={styles.availableBadgeCard}>
              <Image source={{ uri: badge.image }} style={[styles.badgeImage, { opacity: 0.5 }]} />
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeRequirement}>
                {badge.requirement.count} {badge.requirement.type.replace("_", " ")}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Chargement des récompenses...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes récompenses</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rewards.length}</Text>
          <Text style={styles.statLabel}>Récompenses</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rewards.reduce((total, reward) => total + reward.points, 0)}</Text>
          <Text style={styles.statLabel}>Points totaux</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{leaderboard.findIndex((item) => item.user_id === user?.id) + 1 || "-"}</Text>
          <Text style={styles.statLabel}>Classement</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "rewards" && styles.activeTabButton]}
          onPress={() => setActiveTab("rewards")}
        >
          <Text style={[styles.tabText, activeTab === "rewards" && styles.activeTabText]}>Mes badges</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "leaderboard" && styles.activeTabButton]}
          onPress={() => setActiveTab("leaderboard")}
        >
          <Text style={[styles.tabText, activeTab === "leaderboard" && styles.activeTabText]}>Classement</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "rewards" ? (
        <>
          {rewards.length > 0 ? (
            <FlatList
              data={rewards}
              renderItem={renderRewardItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.rewardsList}
              ListHeaderComponent={renderAvailableBadges}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy" size={80} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>Pas encore de récompenses</Text>
              <Text style={styles.emptyText}>
                Participez activement en signalant des incidents et en aidant votre communauté pour gagner des
                récompenses.
              </Text>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Map")}>
                <Text style={styles.actionButtonText}>Signaler un incident</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.user_id.toString()}
          contentContainerStyle={styles.leaderboardList}
          ListHeaderComponent={() => (
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardHeaderRank}>#</Text>
              <Text style={styles.leaderboardHeaderUser}>Utilisateur</Text>
              <Text style={styles.leaderboardHeaderPoints}>Points</Text>
            </View>
          )}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#757575",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#2E7D32",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#757575",
  },
  activeTabText: {
    color: "#2E7D32",
  },
  rewardsList: {
    padding: 15,
  },
  rewardCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  rewardImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 5,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 10,
  },
  rewardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#424242",
    marginLeft: 5,
    marginRight: 10,
  },
  rewardDate: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  availableBadgesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 15,
  },
  availableBadgeCard: {
    alignItems: "center",
    marginRight: 15,
    width: 100,
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#424242",
    textAlign: "center",
    marginBottom: 3,
  },
  badgeRequirement: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
  leaderboardList: {
    padding: 15,
  },
  leaderboardHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 10,
  },
  leaderboardHeaderRank: {
    width: 40,
    fontWeight: "bold",
    color: "#757575",
  },
  leaderboardHeaderUser: {
    flex: 1,
    fontWeight: "bold",
    color: "#757575",
  },
  leaderboardHeaderPoints: {
    width: 60,
    textAlign: "right",
    fontWeight: "bold",
    color: "#757575",
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  leaderboardRank: {
    width: 40,
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
  },
  leaderboardUser: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  leaderboardAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  leaderboardUsername: {
    fontSize: 16,
    color: "#424242",
  },
  leaderboardPoints: {
    width: 60,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "right",
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
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default RewardsScreen

