import { updatePlayerProfile, fetchPlayerProfile } from "./playerService"

// JSON Server Base URL
const API_BASE_URL = "http://localhost:3001"

// Save battle result to the server
export const saveBattleResult = async (battleSummary) => {
  try {
    // First save the battle to history
    const response = await fetch(`${API_BASE_URL}/battles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(battleSummary),
    })

    if (!response.ok) {
      throw new Error(`Failed to save battle result: ${response.status}`)
    }

    // Then update the player profile stats
    const profile = await fetchPlayerProfile()

    if (profile) {
      // Update general battle stats
      const updatedProfile = {
        ...profile,
        totalBattles: (profile.totalBattles || 0) + 1,
        wins: battleSummary.winner === "player" ? (profile.wins || 0) + 1 : profile.wins || 0,
        losses: battleSummary.winner === "bot" ? (profile.losses || 0) + 1 : profile.losses || 0,
      }

      // Update difficulty-specific stats
      const difficulty = battleSummary.difficulty
      const difficultyTotal = `${difficulty}Total`
      const difficultyWins = `${difficulty}Wins`

      updatedProfile[difficultyTotal] = (profile[difficultyTotal] || 0) + 1

      if (battleSummary.winner === "player") {
        updatedProfile[difficultyWins] = (profile[difficultyWins] || 0) + 1
      }

      await updatePlayerProfile(updatedProfile)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in saveBattleResult:", error)
    throw error
  }
}

// Get all battle history
export const getBattleHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/battles`)

    if (!response.ok) {
      throw new Error(`Failed to fetch battle history: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getBattleHistory:", error)
    throw error
  }
}

// Get recent battles
export const getRecentBattles = async (limit = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/battles?_sort=date&_order=desc&_limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch recent battles: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getRecentBattles:", error)
    throw error
  }
}

// Get battle stats summary
export const getBattleStats = async () => {
  try {
    const battles = await getBattleHistory()

    const total = battles.length
    const wins = battles.filter((battle) => battle.winner === "player").length
    const losses = total - wins
    const winRate = total > 0 ? (wins / total) * 100 : 0

    // Get stats by difficulty
    const difficultyStats = {
      easy: { total: 0, wins: 0 },
      medium: { total: 0, wins: 0 },
      hard: { total: 0, wins: 0 },
      insane: { total: 0, wins: 0 },
    }

    battles.forEach((battle) => {
      const difficulty = battle.difficulty || "medium"
      difficultyStats[difficulty].total++

      if (battle.winner === "player") {
        difficultyStats[difficulty].wins++
      }
    })

    return {
      total,
      wins,
      losses,
      winRate,
      byDifficulty: difficultyStats,
    }
  } catch (error) {
    console.error("Error in getBattleStats:", error)
    throw error
  }
}
