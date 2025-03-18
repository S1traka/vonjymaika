import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"

// Types de récompenses
export const REWARD_TYPES = {
  REPORT_INCIDENT: "report_incident",
  VERIFY_INCIDENT: "verify_incident",
  HELP_OTHERS: "help_others",
  DAILY_LOGIN: "daily_login",
  COMPLETE_PROFILE: "complete_profile",
  INVITE_USER: "invite_user",
  SURVIVAL_QUIZ: "survival_quiz",
}

// Points attribués pour chaque type de récompense
export const REWARD_POINTS = {
  [REWARD_TYPES.REPORT_INCIDENT]: 10,
  [REWARD_TYPES.VERIFY_INCIDENT]: 5,
  [REWARD_TYPES.HELP_OTHERS]: 15,
  [REWARD_TYPES.DAILY_LOGIN]: 2,
  [REWARD_TYPES.COMPLETE_PROFILE]: 20,
  [REWARD_TYPES.INVITE_USER]: 25,
  [REWARD_TYPES.SURVIVAL_QUIZ]: 15,
}

// Badges disponibles
export const BADGES = [
  {
    id: "first_report",
    name: "Premier signalement",
    description: "Vous avez signalé votre premier incident",
    image: "https://via.placeholder.com/100?text=Badge1",
    requirement: { type: REWARD_TYPES.REPORT_INCIDENT, count: 1 },
  },
  {
    id: "active_reporter",
    name: "Reporter actif",
    description: "Vous avez signalé 5 incidents",
    image: "https://via.placeholder.com/100?text=Badge2",
    requirement: { type: REWARD_TYPES.REPORT_INCIDENT, count: 5 },
  },
  {
    id: "helper",
    name: "Secouriste",
    description: "Vous avez aidé 3 personnes en danger",
    image: "https://via.placeholder.com/100?text=Badge3",
    requirement: { type: REWARD_TYPES.HELP_OTHERS, count: 3 },
  },
  {
    id: "daily_user",
    name: "Utilisateur fidèle",
    description: "Vous vous êtes connecté 7 jours de suite",
    image: "https://via.placeholder.com/100?text=Badge4",
    requirement: { type: REWARD_TYPES.DAILY_LOGIN, count: 7 },
  },
  {
    id: "survival_expert",
    name: "Expert en survie",
    description: "Vous avez réussi tous les quiz de survie",
    image: "https://via.placeholder.com/100?text=Badge5",
    requirement: { type: REWARD_TYPES.SURVIVAL_QUIZ, count: 5 },
  },
]

// Service de gestion des récompenses
const RewardService = {
  // Récupérer les récompenses de l'utilisateur
  getUserRewards: async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/rewards/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des récompenses")
      }

      return await response.json()
    } catch (error) {
      console.error("Erreur dans getUserRewards:", error)
      throw error
    }
  },

  // Ajouter des points pour une action spécifique
  addPoints: async (userId, actionType) => {
    try {
      if (!REWARD_POINTS[actionType]) {
        throw new Error("Type d'action non reconnu")
      }

      const token = await AsyncStorage.getItem("token")
      const points = REWARD_POINTS[actionType]

      // Enregistrer l'action et les points dans l'API
      const response = await fetch(`${API_URL}/api/rewards/add-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          action_type: actionType,
          points: points,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout des points")
      }

      // Vérifier si de nouveaux badges ont été débloqués
      await RewardService.checkForNewBadges(userId)

      return await response.json()
    } catch (error) {
      console.error("Erreur dans addPoints:", error)
      throw error
    }
  },

  // Vérifier si l'utilisateur a débloqué de nouveaux badges
  checkForNewBadges: async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token")

      // Récupérer les statistiques de l'utilisateur
      const statsResponse = await fetch(`${API_URL}/api/users/${userId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!statsResponse.ok) {
        throw new Error("Erreur lors de la récupération des statistiques")
      }

      const stats = await statsResponse.json()

      // Récupérer les badges actuels de l'utilisateur
      const userRewards = await RewardService.getUserRewards(userId)
      const userBadgeIds = userRewards.map((reward) => reward.badge_id)

      // Vérifier chaque badge pour voir s'il doit être attribué
      for (const badge of BADGES) {
        // Si l'utilisateur a déjà ce badge, passer au suivant
        if (userBadgeIds.includes(badge.id)) continue

        // Vérifier si l'utilisateur remplit les conditions pour ce badge
        const requirement = badge.requirement
        const userCount = stats[requirement.type] || 0

        if (userCount >= requirement.count) {
          // Attribuer le badge à l'utilisateur
          await fetch(`${API_URL}/api/rewards/award-badge`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: userId,
              badge_id: badge.id,
            }),
          })
        }
      }
    } catch (error) {
      console.error("Erreur dans checkForNewBadges:", error)
      throw error
    }
  },

  // Obtenir le classement des utilisateurs
  getLeaderboard: async () => {
    try {
      const token = await AsyncStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/rewards/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du classement")
      }

      return await response.json()
    } catch (error) {
      console.error("Erreur dans getLeaderboard:", error)
      throw error
    }
  },
}

export default RewardService

