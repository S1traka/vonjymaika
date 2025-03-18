import { neon } from "@neondatabase/serverless"
import bcrypt from "bcrypt"
import dotenv from "dotenv"

// Charger les variables d'environnement
dotenv.config()

// Fonction pour ajouter un superuser
async function addSuperUser() {
  try {
    console.log("Connexion à la base de données...")
    const sql = neon(process.env.DATABASE_URL)

    // Vérifier si l'utilisateur existe déjà
    const existingUsers = await sql`
      SELECT * FROM users WHERE username = 'VonjyMaikaSU' OR email = 'admin@vonjymaika.mg'
    `

    if (existingUsers.length > 0) {
      console.log("Un utilisateur avec ce nom ou cet email existe déjà.")
      console.log("Mise à jour du mot de passe et des droits...")

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("SuperUser0", salt)

      // Mettre à jour l'utilisateur existant
      await sql`
        UPDATE users 
        SET 
          password = ${hashedPassword},
          role = 'admin',
          updated_at = CURRENT_TIMESTAMP
        WHERE username = 'VonjyMaikaSU' OR email = 'admin@vonjymaika.mg'
      `

      console.log("Utilisateur superuser mis à jour avec succès!")
      return
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("SuperUser0", salt)

    // Créer le superuser
    const result = await sql`
      INSERT INTO users (
        username, 
        email, 
        phone_number, 
        cin_number, 
        password, 
        role
      )
      VALUES (
        'VonjyMaikaSU', 
        'admin@vonjymaika.mg', 
        '+261 34 00 000 00', 
        '101 123 456 789', 
        ${hashedPassword}, 
        'admin'
      )
      RETURNING id, username, email, role
    `

    console.log("Superuser créé avec succès:")
    console.log(result[0])
  } catch (error) {
    console.error("Erreur lors de la création du superuser:", error)
  }
}

// Exécuter la fonction
addSuperUser()
  .then(() => {
    console.log("Opération terminée.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erreur non gérée:", error)
    process.exit(1)
  })

