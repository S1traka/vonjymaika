import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbiQfp5EUVLK_FxUym6pyCZ7hCu1X1ZPU",
  authDomain: "vonjymaika.firebaseapp.com",
  projectId: "vonjymaika",
  storageBucket: "vonjymaika.appspot.com",
  messagingSenderId: "67330444454",
  appId: "1:67330444454:web:1234567890abcdef",
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

// Demander la permission et obtenir le token FCM
export const requestNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY",
    })

    if (token) {
      console.log("Token FCM:", token)

      // Enregistrer le token sur le serveur
      const userToken = await AsyncStorage.getItem("token")
      const userId = await AsyncStorage.getItem("userId")

      if (userToken && userId) {
        await fetch(`${API_URL}/api/users/fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ fcm_token: token }),
        })
      }

      return token
    } else {
      console.log("Aucune autorisation de notification")
      return null
    }
  } catch (error) {
    console.error("Erreur lors de la demande de permission de notification:", error)
    return null
  }
}

// Écouter les messages en premier plan
export const onForegroundMessage = () => {
  return onMessage(messaging, (payload) => {
    console.log("Message reçu en premier plan:", payload)
    // Ici, vous pouvez afficher une notification personnalisée
    // ou mettre à jour l'interface utilisateur
  })
}

export default app

