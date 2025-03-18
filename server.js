import express from "express"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import { neon } from "@neondatabase/serverless"
import userRoutes from "./routes/userRoutes.js"
import incidentRoutes from "./routes/incidentRoutes.js"
import teamRoutes from "./routes/teamRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import rewardRoutes from "./routes/rewardRoutes.js"
// Importer les middlewares d'authentification
import { isAdmin, isManagerOrAdmin } from "./middleware/authMiddleware.js"

// Charger les variables d'environnement
dotenv.config()

// Initialiser l'application Express
const app = express()
const server = http.createServer(app)

// Configurer Socket.IO pour le chat en temps réel
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Connexion à la base de données PostgreSQL
export const sql = neon(process.env.DATABASE_URL)

// Middleware d'authentification
// Supprimer cette ligne:
// export const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) return res.status(401).json({ message: "Accès non autorisé" });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Token invalide" });
//     req.user = user;
//     next();
//   });
// };

// Exporter les middlewares d'authentification
export { isAdmin, isManagerOrAdmin }

// Routes
app.use("/api/users", userRoutes)
app.use("/api/incidents", incidentRoutes)
app.use("/api/teams", teamRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/rewards", rewardRoutes)

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "API VonjyMaika opérationnelle" })
})

// Configuration de Socket.IO pour le chat en temps réel
io.on("connection", (socket) => {
  console.log("Utilisateur connecté:", socket.id)

  // Rejoindre une salle de chat d'incident
  socket.on("join-incident", (incidentId) => {
    socket.join(`incident-${incidentId}`)
    console.log(`Utilisateur ${socket.id} a rejoint l'incident ${incidentId}`)
  })

  // Envoyer un message
  socket.on("send-message", async (data) => {
    try {
      const { incidentId, userId, message } = data

      // Enregistrer le message dans la base de données
      await sql`
        INSERT INTO chat_messages (incident_id, user_id, message)
        VALUES (${incidentId}, ${userId}, ${message})
      `

      // Diffuser le message à tous les utilisateurs dans la salle
      io.to(`incident-${incidentId}`).emit("new-message", {
        incidentId,
        userId,
        message,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
    }
  })

  // Déconnexion
  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté:", socket.id)
  })
})

// Démarrer le serveur
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`)
})

