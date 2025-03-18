import { sql } from "../server.js"

export const ChatModel = {
  // Enregistrer un nouveau message
  async saveMessage(messageData) {
    const { incident_id, user_id, message } = messageData

    try {
      const result = await sql`
        INSERT INTO chat_messages (incident_id, user_id, message)
        VALUES (${incident_id}, ${user_id}, ${message})
        RETURNING *
      `

      return result[0]
    } catch (error) {
      throw new Error(`Erreur lors de l'enregistrement du message: ${error.message}`)
    }
  },

  // Obtenir les messages d'un incident
  async getMessagesByIncident(incidentId, limit = 50) {
    try {
      return await sql`
        SELECT cm.*, u.username
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.incident_id = ${incidentId}
        ORDER BY cm.created_at DESC
        LIMIT ${limit}
      `
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des messages: ${error.message}`)
    }
  },
}

