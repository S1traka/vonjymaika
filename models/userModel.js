import { sql } from "../server.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const UserModel = {
  // Créer un nouvel utilisateur
  async create(userData) {
    const { username, email, phone_number, cin_number, password, role = "user" } = userData

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    try {
      const result = await sql`
        INSERT INTO users (username, email, phone_number, cin_number, password, role)
        VALUES (${username}, ${email}, ${phone_number}, ${cin_number}, ${hashedPassword}, ${role})
        RETURNING id, username, email, phone_number, cin_number, role, created_at
      `

      return result[0]
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`)
    }
  },

  // Authentifier un utilisateur
  async authenticate(email, password) {
    try {
      const users = await sql`
        SELECT * FROM users WHERE email = ${email}
      `

      if (users.length === 0) {
        return null
      }

      const user = users[0]
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return null
      }

      // Générer un token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          isSuperUser: user.username === "VonjyMaikaSU", // Ajouter un flag pour le superuser
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        },
      )

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
          isSuperUser: user.username === "VonjyMaikaSU",
        },
      }
    } catch (error) {
      throw new Error(`Erreur lors de l'authentification: ${error.message}`)
    }
  },

  // Obtenir tous les utilisateurs
  async getAll() {
    try {
      return await sql`
        SELECT id, username, email, phone_number, role, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`)
    }
  },

  // Obtenir un utilisateur par ID
  async getById(id) {
    try {
      const users = await sql`
        SELECT id, username, email, phone_number, cin_number, role, created_at, updated_at
        FROM users
        WHERE id = ${id}
      `

      return users.length > 0 ? users[0] : null
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`)
    }
  },

  // Mettre à jour un utilisateur
  async update(id, userData) {
    const { username, email, phone_number, cin_number, role } = userData

    try {
      const result = await sql`
        UPDATE users
        SET 
          username = COALESCE(${username}, username),
          email = COALESCE(${email}, email),
          phone_number = COALESCE(${phone_number}, phone_number),
          cin_number = COALESCE(${cin_number}, cin_number),
          role = COALESCE(${role}, role),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, username, email, phone_number, cin_number, role, created_at, updated_at
      `

      return result.length > 0 ? result[0] : null
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`)
    }
  },

  // Supprimer un utilisateur
  async delete(id) {
    try {
      await sql`DELETE FROM users WHERE id = ${id}`
      return { success: true }
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`)
    }
  },
}

