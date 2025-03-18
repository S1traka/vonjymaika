import express from "express"
import { RewardModel } from "../models/rewardModel.js"
import { authenticateToken } from "../server.js"

const router = express.Router()

// Créer une nouvelle récompense (admin seulement)
router.post("/", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const reward = await RewardModel.create(req.body)
    res.status(201).json(reward)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Obtenir toutes les récompenses
router.get("/", async (req, res) => {
  try {
    const rewards = await RewardModel.getAll()
    res.json(rewards)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Attribuer une récompense à un utilisateur (admin seulement)
router.post("/award", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { user_id, reward_id } = req.body
    const userReward = await RewardModel.awardToUser(user_id, reward_id)
    res.status(201).json(userReward)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Obtenir les récompenses d'un utilisateur
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur demande ses propres récompenses ou est un admin
    if (req.user.id !== Number.parseInt(req.params.userId) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const rewards = await RewardModel.getUserRewards(req.params.userId)
    res.json(rewards)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

