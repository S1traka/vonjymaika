import { sql } from "../server.js"

export const RewardModel = {
  // Créer une nouvelle récompense
  async create(rewardData) {
    const { name, description, points, badge_image_url } = rewardData

    try {
      const result = await sql`
        INSERT INTO rewards (name, description, points, badge_image_url)
        VALUES (${name}, ${description}, ${points}, ${badge_image_url})
        RETURNING *
      `

      return result[0]
    } catch (error) {
      throw new Error(`Erreur lors de la création de la récompense: ${error.message}`)
    }
  },

  // Obtenir toutes les récompenses
  async getAll() {
    try {
      return await sql`
        SELECT * FROM rewards
        ORDER BY points ASC
      `
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des récompenses: ${error.message}`)
    }
  },

  // Attribuer une récompense à un utilisateur
  async awardToUser(userId, rewardId) {
    try {
      const result = await sql`
        INSERT INTO user_rewards (user_id, reward_id)
        VALUES (${userId}, ${rewardId})
        RETURNING *
      `

      return result[0]
    } catch (error) {
      throw new Error(`Erreur lors de l'attribution de la récompense: ${error.message}`)
    }
  },

  // Obtenir les récompenses d'un utilisateur
  async getUserRewards(userId) {
    try {
      return await sql`
        SELECT ur.*, r.name, r.description, r.points, r.badge_image_url
        FROM user_rewards ur
        JOIN rewards r ON ur.reward_id = r.id
        WHERE ur.user_id = ${userId}
        ORDER BY ur.earned_at DESC
      `
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des récompenses de l'utilisateur: ${error.message}`)
    }
  },
}

