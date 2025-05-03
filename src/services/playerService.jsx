// JSON Server Base URL
const API_BASE_URL = "http://localhost:3001"

// Fetch player profile from the server
export const fetchPlayerProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/1`)

    // If profile doesn't exist yet, return null
    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in fetchPlayerProfile:", error)
    throw error
  }
}

// Create a default profile if none exists
export const createDefaultProfile = async () => {
  try {
    const defaultProfile = {
      id: 1,
      username: "Trainer",
      avatarColor: "#E53E3E", // Red color
      createdAt: new Date().toISOString(),
      totalBattles: 0,
      wins: 0,
      losses: 0,
      easyWins: 0,
      easyTotal: 0,
      mediumWins: 0,
      mediumTotal: 0,
      hardWins: 0,
      hardTotal: 0,
      insaneWins: 0,
      insaneTotal: 0,
      favoritePokemon: null,
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(defaultProfile),
    })

    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in createDefaultProfile:", error)
    throw error
  }
}

// Update player profile
export const updatePlayerProfile = async (profile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${profile.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    })

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in updatePlayerProfile:", error)
    throw error
  }
}

// Update player's favorite Pokémon
export const updateFavoritePokemon = async (pokemon) => {
  try {
    // Get current profile
    const profile = await fetchPlayerProfile();
    
    if (!profile) {
      throw new Error('Player profile not found');
    }
    
    // Update favorite Pokémon
    const updatedProfile = {
      ...profile,
      favoritePokemon: pokemon
    };
    
    return await updatePlayerProfile(updatedProfile);
  } catch (error) {
    console.error('Error in updateFavoritePokemon:', error);
    throw error;
  }
}
