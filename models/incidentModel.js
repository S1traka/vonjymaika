import { sql } from "../server.js"

export const IncidentModel = {
  // Créer un nouvel incident
  async create(incidentData) {
    const { title, description, latitude, longitude, status, severity, reported_by } = incidentData

    try {
      const result = await sql`
        INSERT INTO incidents (title, description, latitude, longitude, status, severity, reported_by)
        VALUES (${title}, ${description}, ${latitude}, ${longitude}, ${status || "active"}, ${severity || "medium"}, ${reported_by})
        RETURNING *
      `

      return result[0]
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'incident: ${error.message}`)
    }
  },

  // Obtenir tous les incidents
  async getAll() {
    try {
      return await sql`
        SELECT i.*, u.username as reporter_name
        FROM incidents i
        LEFT JOIN users u ON i.reported_by = u.id
        ORDER BY i.created_at DESC
      `
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des incidents: ${error.message}`)
    }
  },

  // Obtenir les incidents à proximité
  async getNearby(latitude, longitude, radiusKm = 5) {
    try {
      // Conversion approximative: 1 degré de latitude = 111 km
      const latDelta = radiusKm / 111
      // Conversion approximative: 1 degré de longitude = 111 * cos(latitude) km
      const longDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))

      return await sql`
        SELECT i.*, u.username as reporter_name
        FROM incidents i
        LEFT JOIN users u ON i.reported_by = u.id
        WHERE 
          i.latitude BETWEEN ${latitude - latDelta} AND ${latitude + latDelta}
          AND i.longitude BETWEEN ${longitude - longDelta} AND ${longitude + longDelta}
          AND i.status = 'active'
        ORDER BY i.created_at DESC
      `
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des incidents à proximité: ${error.message}`)
    }
  },

  // Obtenir un incident par ID
  async getById(id) {
    try {
      const incidents = await sql`
        SELECT i.*, u.username as reporter_name
        FROM incidents i
        LEFT JOIN users u ON i.reported_by = u.id
        WHERE i.id = ${id}
      `

      return incidents.length > 0 ? incidents[0] : null
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'incident: ${error.message}`)
    }
  },

  // Mettre à jour un incident
  async update(id, incidentData) {
    const { title, description, status, severity } = incidentData

    try {
      const result = await sql`
        UPDATE incidents
        SET 
          title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          status = COALESCE(${status}, status),
          severity = COALESCE(${severity}, severity),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `

      return result.length > 0 ? result[0] : null
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'incident: ${error.message}`)
    }
  },

  // Supprimer un incident
  async delete(id) {
    try {
      await sql`DELETE FROM incidents WHERE id = ${id}`
      return { success: true }
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'incident: ${error.message}`)
    }
  },
}

