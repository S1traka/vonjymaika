import express from "express"
import { IncidentModel } from "../models/incidentModel.js"
import { authenticateToken } from "../server.js"
import fetch from "node-fetch"

const router = express.Router()

// Créer un nouvel incident
router.post("/", authenticateToken, async (req, res) => {
  try {
    const incidentData = {
      ...req.body,
      reported_by: req.user.id,
    }

    const incident = await IncidentModel.create(incidentData)

    // Ici, on pourrait ajouter la logique pour envoyer des notifications push
    // via Firebase Cloud Messaging aux utilisateurs à proximité

    res.status(201).json(incident)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Obtenir tous les incidents
router.get("/", async (req, res) => {
  try {
    const incidents = await IncidentModel.getAll()
    res.json(incidents)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Obtenir les incidents à proximité
router.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude et longitude requises" })
    }

    const incidents = await IncidentModel.getNearby(
      Number.parseFloat(latitude),
      Number.parseFloat(longitude),
      radius ? Number.parseFloat(radius) : 5,
    )

    res.json(incidents)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Obtenir un incident par ID
router.get("/:id", async (req, res) => {
  try {
    const incident = await IncidentModel.getById(req.params.id)

    if (!incident) {
      return res.status(404).json({ message: "Incident non trouvé" })
    }

    res.json(incident)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mettre à jour un incident
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est l'auteur de l'incident ou un admin
    const incident = await IncidentModel.getById(req.params.id)

    if (!incident) {
      return res.status(404).json({ message: "Incident non trouvé" })
    }

    if (incident.reported_by !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const updatedIncident = await IncidentModel.update(req.params.id, req.body)
    res.json(updatedIncident)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Supprimer un incident
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est l'auteur de l'incident ou un admin
    const incident = await IncidentModel.getById(req.params.id)

    if (!incident) {
      return res.status(404).json({ message: "Incident non trouvé" })
    }

    if (incident.reported_by !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const result = await IncidentModel.delete(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Recherche d'adresse avec OpenStreetMap (Nominatim)
router.get("/geocode/search", async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ message: "Paramètre de recherche requis" })
    }

    // Respecter les limites d'utilisation de Nominatim (1 requête par seconde)
    const response = await fetch(
      `${process.env.OPENSTREETMAP_API_URL}/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
      {
        headers: {
          "User-Agent": "VonjyMaika Emergency App",
        },
      },
    )

    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Reverse géocodage avec OpenStreetMap (Nominatim)
router.get("/geocode/reverse", async (req, res) => {
  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude et longitude requises" })
    }

    // Respecter les limites d'utilisation de Nominatim (1 requête par seconde)
    const response = await fetch(`${process.env.OPENSTREETMAP_API_URL}/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: {
        "User-Agent": "VonjyMaika Emergency App",
      },
    })

    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

