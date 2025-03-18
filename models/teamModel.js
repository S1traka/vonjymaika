import { sql } from "../server.js"

export const TeamModel = {
  // Créer une nouvelle équipe
  async create(teamData) {
    const { name, company_id } = teamData

    try {
      const result = await sql`
        INSERT INTO teams (name, company_id)
        VALUES (${name}, ${company_id})
        RETURNING *
      `

      return result[0]
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'équipe: ${error.message}`)
    }
  },

  // Obtenir toutes les équipes
  async getAll(companyId = null) {
    try {
      if (companyId) {
        return await sql`
          SELECT * FROM teams
          WHERE company_id = ${companyId}
          ORDER BY created_at DESC
        `
      } else {
        return await sql`
          SELECT * FROM teams
          ORDER BY created_at DESC
        `
      }
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des équipes: ${error.message}`)
    }
  },

  // Obtenir une équipe par ID
  async getById(id) {
    try {
      const teams = await sql`
        SELECT * FROM teams WHERE id = ${id}
      `

      return teams.length > 0 ? teams[0] : null
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'équipe: ${error.message}`)
    }
  },

  // Mettre à jour une équipe
  async update(id, teamData) {
    const { name } = teamData

    try {
      const result = await sql`
        UPDATE teams
        SET 
          name = COALESCE(${name}, name),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `

      return result.length > 0 ? result[0] : null
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'équipe: ${error.message}`)
    }
  },

  // Supprimer une équipe
  async delete(id) {
    try {
      await sql`DELETE FROM teams WHERE id = ${id}`
      return { success: true }
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'équipe: ${error.message}`)
    }
  },

  // Ajouter un membre à l'équipe
  async addMember(teamId, userId, role = "member") {
    try {
      const result = await sql`
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (${teamId}, ${userId}, ${role})
        RETURNING *
      `

      return result[0]
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout du membre à l'équipe: ${error.message}`)
    }
  },

  // Obtenir les membres d'une équipe
  async getMembers(teamId) {
    try {
      return await sql`
        SELECT tm.*, u.username, u.email, u.phone_number
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ${teamId}
        ORDER BY tm.created_at DESC
      `
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des membres de l'équipe: ${error.message}`)
    }
  },

  // Supprimer un membre de l'équipe
  async removeMember(teamId, userId) {
    try {
      await sql`
        DELETE FROM team_members
        WHERE team_id = ${teamId} AND user_id = ${userId}
      `
      return { success: true }
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du membre de l'équipe: ${error.message}`)
    }
  },
}

