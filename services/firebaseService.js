import admin from "firebase-admin"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialiser Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
  })
  console.log("Firebase Admin SDK initialisé avec succès")
} catch (error) {
  console.error("Erreur lors de l'initialisation de Firebase Admin SDK:", error)
}

export const FirebaseService = {
  // Envoyer une notification à un utilisateur spécifique
  async sendNotificationToUser(userId, title, body, data = {}) {
    try {
      // Récupérer le token FCM de l'utilisateur depuis la base de données
      // Cette partie dépend de votre implémentation pour stocker les tokens FCM
      const userToken = await getUserFCMToken(userId)

      if (!userToken) {
        throw new Error("Token FCM non trouvé pour cet utilisateur")
      }

      const message = {
        notification: {
          title,
          body,
        },
        data,
        token: userToken,
      }

      const response = await admin.messaging().send(message)
      return response
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error)
      throw error
    }
  },

  // Envoyer une notification à plusieurs utilisateurs
  async sendNotificationToUsers(userIds, title, body, data = {}) {
    try {
      // Récupérer les tokens FCM des utilisateurs depuis la base de données
      const userTokens = await getUsersFCMTokens(userIds)

      if (userTokens.length === 0) {
        throw new Error("Aucun token FCM trouvé pour ces utilisateurs")
      }

      const message = {
        notification: {
          title,
          body,
        },
        data,
        tokens: userTokens,
      }

      const response = await admin.messaging().sendMulticast(message)
      return response
    } catch (error) {
      console.error("Erreur lors de l'envoi des notifications:", error)
      throw error
    }
  },

  // Envoyer une notification à un sujet (topic)
  async sendNotificationToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data,
        topic,
      }

      const response = await admin.messaging().send(message)
      return response
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification au sujet:", error)
      throw error
    }
  },
}

// Fonction fictive pour récupérer le token FCM d'un utilisateur
// À remplacer par votre implémentation réelle
async function getUserFCMToken(userId) {
  // Exemple: récupérer le token depuis la base de données
  return "user_fcm_token"
}

// Fonction fictive pour récupérer les tokens FCM de plusieurs utilisateurs
// À remplacer par votre implémentation réelle
async function getUsersFCMTokens(userIds) {
  // Exemple: récupérer les tokens depuis la base de données
  return ["user1_fcm_token", "user2_fcm_token"]
}

