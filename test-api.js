import fetch from "node-fetch"

// Configuration
const API_URL = "http://localhost:3000"
const TEST_USER = {
  email: "user1@vonjymaika.mg",
  password: "password123",
}

// Fonction pour tester l'API
async function testAPI() {
  console.log("🧪 Test de l'API VonjyMaika")
  console.log("============================")

  try {
    // 1. Test de la connexion
    console.log("\n1. Test de connexion utilisateur")
    const loginResponse = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TEST_USER),
    })

    const loginData = await loginResponse.json()

    if (!loginResponse.ok) {
      throw new Error(`Échec de la connexion: ${loginData.message}`)
    }

    console.log("✅ Connexion réussie")
    console.log(`Token JWT: ${loginData.token.substring(0, 20)}...`)

    const token = loginData.token
    const userId = loginData.user.id

    // 2. Test de récupération des incidents
    console.log("\n2. Test de récupération des incidents")
    const incidentsResponse = await fetch(`${API_URL}/api/incidents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const incidentsData = await incidentsResponse.json()

    if (!incidentsResponse.ok) {
      throw new Error(`Échec de la récupération des incidents: ${incidentsData.message}`)
    }

    console.log(`✅ ${incidentsData.length} incidents récupérés`)
    console.log("Premier incident:", incidentsData[0].title)

    // 3. Test de récupération des incidents à proximité
    console.log("\n3. Test de récupération des incidents à proximité")
    const nearbyResponse = await fetch(
      `${API_URL}/api/incidents/nearby?latitude=-18.8792&longitude=47.5079&radius=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    const nearbyData = await nearbyResponse.json()

    if (!nearbyResponse.ok) {
      throw new Error(`Échec de la récupération des incidents à proximité: ${nearbyData.message}`)
    }

    console.log(`✅ ${nearbyData.length} incidents à proximité récupérés`)

    // 4. Test de récupération des messages de chat d'un incident
    console.log("\n4. Test de récupération des messages de chat")
    const chatResponse = await fetch(`${API_URL}/api/chat/incident/1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const chatData = await chatResponse.json()

    if (!chatResponse.ok) {
      throw new Error(`Échec de la récupération des messages: ${chatData.message}`)
    }

    console.log(`✅ ${chatData.length} messages récupérés`)
    if (chatData.length > 0) {
      console.log("Dernier message:", chatData[0].message)
    }

    // 5. Test de récupération des récompenses de l'utilisateur
    console.log("\n5. Test de récupération des récompenses")
    const rewardsResponse = await fetch(`${API_URL}/api/rewards/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const rewardsData = await rewardsResponse.json()

    if (!rewardsResponse.ok) {
      throw new Error(`Échec de la récupération des récompenses: ${rewardsData.message}`)
    }

    console.log(`✅ ${rewardsData.length} récompenses récupérées`)
    if (rewardsData.length > 0) {
      console.log("Première récompense:", rewardsData[0].name)
    }

    console.log("\n✨ Tous les tests ont réussi!")
    console.log("L'API VonjyMaika fonctionne correctement.")
  } catch (error) {
    console.error("\n❌ Erreur lors des tests:", error.message)
  }
}

// Exécuter les tests
testAPI()

