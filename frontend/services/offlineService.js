import AsyncStorage from "@react-native-async-storage/async-storage"
import NetInfo from "@react-native-community/netinfo"
import { API_URL } from "../config"

// Clés pour le stockage local
const STORAGE_KEYS = {
  PENDING_INCIDENTS: "pendingIncidents",
  CACHED_INCIDENTS: "cachedIncidents",
  CACHED_TEAMS: "cachedTeams",
  CACHED_REWARDS: "cachedRewards",
  LAST_SYNC: "lastSync",
}

const OfflineService = {
  // Vérifier si l'appareil est connecté à Internet
  isConnected: async () => {
    const netInfo = await NetInfo.fetch()
    return netInfo.isConnected && netInfo.isInternetReachable
  },

  // Sauvegarder un incident en mode hors ligne
  saveIncidentOffline: async (incidentData) => {
    try {
      // Récupérer les incidents en attente
      const pendingIncidentsJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_INCIDENTS)
      const pendingIncidents = pendingIncidentsJson ? JSON.parse(pendingIncidentsJson) : []

      // Ajouter le nouvel incident avec un ID temporaire
      const newIncident = {
        ...incidentData,
        id: `temp_${Date.now()}`,
        created_at: new Date().toISOString(),
        status: "pending_sync",
      }

      pendingIncidents.push(newIncident)

      // Sauvegarder la liste mise à jour
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_INCIDENTS, JSON.stringify(pendingIncidents))

      return newIncident
    } catch (error) {
      console.error("Erreur dans saveIncidentOffline:", error)
      throw error
    }
  },

  // Synchroniser les incidents en attente avec le serveur
  syncPendingIncidents: async () => {
    try {
      // Vérifier la connexion Internet
      const isConnected = await OfflineService.isConnected()
      if (!isConnected) {
        throw new Error("Pas de connexion Internet")
      }

      // Récupérer les incidents en attente
      const pendingIncidentsJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_INCIDENTS)
      if (!pendingIncidentsJson) return { synced: 0, failed: 0 }

      const pendingIncidents = JSON.parse(pendingIncidentsJson)
      if (pendingIncidents.length === 0) return { synced: 0, failed: 0 }

      const token = await AsyncStorage.getItem("token")
      if (!token) throw new Error("Non authentifié")

      // Statistiques de synchronisation
      let synced = 0
      let failed = 0
      const remainingIncidents = []

      // Synchroniser chaque incident
      for (const incident of pendingIncidents) {
        try {
          // Supprimer les propriétés temporaires
          const { id, status, ...incidentData } = incident

          // Envoyer l'incident au serveur
          const response = await fetch(`${API_URL}/api/incidents`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(incidentData),
          })

          if (!response.ok) {
            throw new Error("Erreur lors de la synchronisation")
          }

          synced++
        } catch (error) {
          console.error("Erreur lors de la synchronisation d'un incident:", error)
          remainingIncidents.push(incident)
          failed++
        }
      }

      // Mettre à jour la liste des incidents en attente
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_INCIDENTS, JSON.stringify(remainingIncidents))

      // Mettre à jour la date de dernière synchronisation
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())

      return { synced, failed }
    } catch (error) {
      console.error("Erreur dans syncPendingIncidents:", error)
      throw error
    }
  },

  // Mettre en cache les incidents récents
  cacheIncidents: async (incidents) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_INCIDENTS, JSON.stringify(incidents))
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
    } catch (error) {
      console.error("Erreur dans cacheIncidents:", error)
      throw error
    }
  },

  // Récupérer les incidents en cache
  getCachedIncidents: async () => {
    try {
      const cachedIncidentsJson = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_INCIDENTS)
      return cachedIncidentsJson ? JSON.parse(cachedIncidentsJson) : []
    } catch (error) {
      console.error("Erreur dans getCachedIncidents:", error)
      throw error
    }
  },

  // Mettre en cache les équipes
  cacheTeams: async (teams) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_TEAMS, JSON.stringify(teams))
    } catch (error) {
      console.error("Erreur dans cacheTeams:", error)
      throw error
    }
  },

  // Récupérer les équipes en cache
  getCachedTeams: async () => {
    try {
      const cachedTeamsJson = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_TEAMS)
      return cachedTeamsJson ? JSON.parse(cachedTeamsJson) : []
    } catch (error) {
      console.error("Erreur dans getCachedTeams:", error)
      throw error
    }
  },

  // Mettre en cache les récompenses
  cacheRewards: async (rewards) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_REWARDS, JSON.stringify(rewards))
    } catch (error) {
      console.error("Erreur dans cacheRewards:", error)
      throw error
    }
  },

  // Récupérer les récompenses en cache
  getCachedRewards: async () => {
    try {
      const cachedRewardsJson = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_REWARDS)
      return cachedRewardsJson ? JSON.parse(cachedRewardsJson) : []
    } catch (error) {
      console.error("Erreur dans getCachedRewards:", error)
      throw error
    }
  },

  // Vérifier si une synchronisation est nécessaire
  isSyncNeeded: async (maxAgeInMinutes = 30) => {
    try {
      const lastSyncJson = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC)

      if (!lastSyncJson) return true

      const lastSync = new Date(lastSyncJson)
      const now = new Date()

      // Calculer la différence en minutes
      const diffInMinutes = (now - lastSync) / (1000 * 60)

      return diffInMinutes > maxAgeInMinutes
    } catch (error) {
      console.error("Erreur dans isSyncNeeded:", error)
      return true
    }
  },

  // Effacer toutes les données en cache
  clearCache: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHED_INCIDENTS)
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHED_TEAMS)
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHED_REWARDS)
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC)
    } catch (error) {
      console.error("Erreur dans clearCache:", error)
      throw error
    }
  },
}

export default OfflineService

