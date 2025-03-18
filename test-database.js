import { neon } from "@neondatabase/serverless"
import dotenv from "dotenv"

// Charger les variables d'environnement
dotenv.config()

// Fonction pour tester la connexion à la base de données
async function testDatabase() {
  console.log("🧪 Test de connexion à la base de données PostgreSQL")
  console.log("=================================================")

  try {
    // Vérifier si la variable d'environnement DATABASE_URL est définie
    if (!process.env.DATABASE_URL) {
      throw new Error("La variable d'environnement DATABASE_URL n'est pas définie")
    }

    console.log("Tentative de connexion à la base de données...")

    // Créer une connexion à la base de données
    const sql = neon(process.env.DATABASE_URL)

    // Tester la connexion avec une requête simple
    const result = await sql`SELECT current_timestamp as time, current_database() as database`

    console.log("✅ Connexion réussie!")
    console.log(`Base de données: ${result[0].database}`)
    console.log(`Heure du serveur: ${result[0].time}`)

    // Compter le nombre d'utilisateurs
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`
    console.log(`Nombre d'utilisateurs: ${usersCount[0].count}`)

    // Compter le nombre d'incidents
    const incidentsCount = await sql`SELECT COUNT(*) as count FROM incidents`
    console.log(`Nombre d'incidents: ${incidentsCount[0].count}`)

    // Compter le nombre d'équipes
    const teamsCount = await sql`SELECT COUNT(*) as count FROM teams`
    console.log(`Nombre d'équipes: ${teamsCount[0].count}`)

    // Compter le nombre de messages de chat
    const messagesCount = await sql`SELECT COUNT(*) as count FROM chat_messages`
    console.log(`Nombre de messages de chat: ${messagesCount[0].count}`)

    // Compter le nombre de récompenses
    const rewardsCount = await sql`SELECT COUNT(*) as count FROM rewards`
    console.log(`Nombre de récompenses: ${rewardsCount[0].count}`)

    console.log("\n✨ Tous les tests ont réussi!")
    console.log("La connexion à la base de données fonctionne correctement.")
  } catch (error) {
    console.error("\n❌ Erreur lors des tests:", error)
    console.error("Vérifiez vos variables d'environnement et la connexion à la base de données.")
  }
}

// Exécuter les tests
testDatabase()

