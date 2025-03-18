import express from "express"
import { UserModel } from "../models/userModel.js"
import { authenticateToken } from "../server.js"

const router = express.Router()

// Inscription d'un nouvel utilisateur
router.post("/register", async (req, res) => {
  try {
    const user = await UserModel.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Connexion d'un utilisateur
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const authResult = await UserModel.authenticate(email, password)

    if (!authResult) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" })
    }

    res.json(authResult)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Obtenir tous les utilisateurs (admin seulement)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const users = await UserModel.getAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Obtenir un utilisateur par ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur demande ses propres informations ou est un admin
    if (req.user.id !== Number.parseInt(req.params.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const user = await UserModel.getById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mettre à jour un utilisateur
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur met à jour ses propres informations ou est un admin
    if (req.user.id !== Number.parseInt(req.params.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const user = await UserModel.update(req.params.id, req.body)

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    res.json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Supprimer un utilisateur (admin seulement)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const result = await UserModel.delete(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

