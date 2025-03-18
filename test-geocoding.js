import fetch from "node-fetch"
import dotenv from "dotenv"

// Charger les variables d'environnement
dotenv.config()

// Configuration
const OPENSTREETMAP_API_URL = process.env.OPENSTREETMAP_API_URL || "https://nominatim.openstreetmap.org"

// Fonction pour tester le géocodage
async function testGeocoding() {
  console.log("🧪 Test de géocodage avec OpenStreetMap")
  console.log("======================================")

  try {
    // 1. Test de recherche d'adresse
    console.log("\n1. Test de recherche d'adresse")
    const searchQuery = "Antananarivo, Madagascar"

    // Respecter les limites d'utilisation de Nominatim (1 requête par seconde)
    const searchResponse = await fetch(
      `${OPENSTREETMAP_API_URL}/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "VonjyMaika Emergency App Test",
        },
      },
    )

    const searchData = await searchResponse.json()

    if (!searchResponse.ok || searchData.length === 0) {
      throw new Error("Échec de la recherche d'adresse")
    }

    const location = searchData[0]
    console.log("✅ Adresse trouvée:")
    console.log(`Nom: ${location.display_name}`)
    console.log(`Latitude: ${location.lat}`)
    console.log(`Longitude: ${location.lon}`)

    // Attendre 1 seconde pour respecter les limites d'utilisation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 2. Test de géocodage inverse
    console.log("\n2. Test de géocodage inverse")
    const latitude = location.lat
    const longitude = location.lon

    const reverseResponse = await fetch(
      `${OPENSTREETMAP_API_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          "User-Agent": "VonjyMaika Emergency App Test",
        },
      },
    )

    const reverseData = await reverseResponse.json()

    if (!reverseResponse.ok) {
      throw new Error("Échec du géocodage inverse")
    }

    console.log("✅ Emplacement trouvé:")
    console.log(`Adresse: ${reverseData.display_name}`)
    console.log(`Type: ${reverseData.type}`)
    if (reverseData.address) {
      console.log("Détails:")
      console.log(`  Ville: ${reverseData.address.city || reverseData.address.town || "N/A"}`)
      console.log(`  Quartier: ${reverseData.address.suburb || "N/A"}`)
      console.log(`  Rue: ${reverseData.address.road || "N/A"}`)
    }

    console.log("\n✨ Tous les tests ont réussi!")
    console.log("Le géocodage avec OpenStreetMap fonctionne correctement.")
  } catch (error) {
    console.error("\n❌ Erreur lors des tests:", error.message)
  }
}

// Exécuter les tests
testGeocoding()

