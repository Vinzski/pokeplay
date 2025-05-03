// JSON Server Base URL
const API_BASE_URL = "http://localhost:3001"

// Get the current user's team
export const getUserTeam = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/1`)

    // If the team doesn't exist yet, return an empty array
    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch team: ${response.status}`)
    }

    const data = await response.json()
    return data.pokemon || []
  } catch (error) {
    console.error("Error in getUserTeam:", error)
    throw error
  }
}

// Save the entire Pokémon team
export const savePokemonTeam = async (team) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        pokemon: team,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save team: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in savePokemonTeam:", error)
    throw error
  }
}

// Add a Pokémon to the team
export const addPokemonToTeam = async (pokemon) => {
  try {
    // Get current team
    const currentTeam = await getUserTeam()

    // Check if team already has 6 Pokémon
    if (currentTeam.length >= 6) {
      return { success: false, message: "Your team is full! Remove a Pokémon first." }
    }

    // Check if Pokémon is already in the team
    const isPokemonInTeam = currentTeam.some((p) => p.id === pokemon.id)
    if (isPokemonInTeam) {
      return { success: false, message: `${pokemon.name} is already in your team!` }
    }

    // Add the Pokémon to the team
    const updatedTeam = [...currentTeam, pokemon]
    await savePokemonTeam(updatedTeam)

    return { success: true, message: `${pokemon.name} was added to your team!` }
  } catch (error) {
    console.error("Error in addPokemonToTeam:", error)
    throw error
  }
}

// Remove a Pokémon from the team
export const removePokemonFromTeam = async (pokemonId) => {
  try {
    // Get current team
    const currentTeam = await getUserTeam()

    // Find the Pokémon in the team
    const pokemonIndex = currentTeam.findIndex((p) => p.id === pokemonId)

    if (pokemonIndex === -1) {
      return { success: false, message: "Pokémon not found in your team!" }
    }

    // Remove the Pokémon from the team
    const pokemonName = currentTeam[pokemonIndex].name
    const updatedTeam = currentTeam.filter((p) => p.id !== pokemonId)
    await savePokemonTeam(updatedTeam)

    return { success: true, message: `${pokemonName} was removed from your team!` }
  } catch (error) {
    console.error("Error in removePokemonFromTeam:", error)
    throw error
  }
}

// Replace a Pokémon in the team
export const replacePokemonInTeam = async (index, newPokemon) => {
  try {
    // Get current team
    const currentTeam = await getUserTeam()

    // Check if index is valid
    if (index < 0 || index >= currentTeam.length) {
      return { success: false, message: "Invalid team position!" }
    }

    // Check if Pokémon is already in the team
    const isPokemonInTeam = currentTeam.some((p) => p.id === newPokemon.id)
    if (isPokemonInTeam) {
      return { success: false, message: `${newPokemon.name} is already in your team!` }
    }

    // Replace the Pokémon
    const updatedTeam = [...currentTeam]
    updatedTeam[index] = newPokemon
    await savePokemonTeam(updatedTeam)

    return { success: true, message: `${newPokemon.name} replaced ${currentTeam[index].name} in your team!` }
  } catch (error) {
    console.error("Error in replacePokemonInTeam:", error)
    throw error
  }
}
