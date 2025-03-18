import express from "express"
import { TeamModel } from "../models/teamModel.js"
import { authenticateToken } from "../server.js"

const router = express.Router()

// Créer une nouvelle équipe
router.post("/", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin ou un manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const teamData = {
      ...req.body,
      company_id: req.body.company_id,
    }

    const team = await TeamModel.create(teamData)
    res.status(201).json(team)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Obtenir toutes les équipes
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.query
    const teams = await TeamModel.getAll(company_id)
    res.json(teams)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Obtenir une équipe par ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const team = await TeamModel.getById(req.params.id)

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" })
    }

    res.json(team)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mettre à jour une équipe
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin ou un manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const team = await TeamModel.update(req.params.id, req.body)

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" })
    }

    res.json(team)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Supprimer une équipe
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const result = await TeamModel.delete(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Ajouter un membre à l'équipe
router.post("/:id/members", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin ou un manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { user_id, role } = req.body
    const member = await TeamModel.addMember(req.params.id, user_id, role)
    res.status(201).json(member)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Obtenir les membres d'une équipe
router.get("/:id/members", authenticateToken, async (req, res) => {
  try {
    const members = await TeamModel.getMembers(req.params.id)
    res.json(members)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Supprimer un membre de l'équipe
router.delete("/:id/members/:userId", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin ou un manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const result = await TeamModel.removeMember(req.params.id, req.params.userId)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

