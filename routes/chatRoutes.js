import express from "express"
import { ChatModel } from "../models/chatModel.js"
import { authenticateToken } from "../server.js"

const router = express.Router()

// Enregistrer un nouveau message
router.post("/", authenticateToken, async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      user_id: req.user.id,
    }

    const message = await ChatModel.saveMessage(messageData)
    res.status(201).json(message)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Obtenir les messages d'un incident
router.get("/incident/:incidentId", async (req, res) => {
  try {
    const { limit } = req.query
    const messages = await ChatModel.getMessagesByIncident(req.params.incidentId, limit ? Number.parseInt(limit) : 50)
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

