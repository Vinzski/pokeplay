import { extractIdFromUrl } from "../utils/helpers"

// Base URL for the PokéAPI
const POKE_API_BASE_URL = "https://pokeapi.co/api/v2"

// Function to fetch a list of Pokémon with pagination
export const fetchPokemonList = async (limit = 20, offset = 0) => {
  try {
    const response = await fetch(`${POKE_API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokémon list: ${response.status}`)
    }

    const data = await response.json()

    // Add IDs to the results for easier access
    data.results = data.results.map((pokemon) => ({
      ...pokemon,
      id: extractIdFromUrl(pokemon.url),
    }))

    return data
  } catch (error) {
    console.error("Error in fetchPokemonList:", error)
    throw error
  }
}

// Function to fetch detailed information about a specific Pokémon
export const fetchPokemonDetails = async (idOrName) => {
  try {
    const response = await fetch(`${POKE_API_BASE_URL}/pokemon/${idOrName}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokémon details: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error in fetchPokemonDetails for ${idOrName}:`, error)
    throw error
  }
}

// Function to fetch a batch of Pokémon details by their IDs
export const fetchPokemonBatch = async (ids) => {
  try {
    const promises = ids.map((id) => fetchPokemonDetails(id))
    return await Promise.all(promises)
  } catch (error) {
    console.error("Error in fetchPokemonBatch:", error)
    throw error
  }
}

// Function to search for Pokémon by name
export const searchPokemon = async (query) => {
  try {
    // First get a large batch of Pokémon
    const { results } = await fetchPokemonList(500, 0)

    // Filter by name containing the query
    const filtered = results.filter((pokemon) => pokemon.name.toLowerCase().includes(query.toLowerCase()))

    // If we have results, fetch details for each
    if (filtered.length > 0) {
      const detailsPromises = filtered.map((pokemon) => fetchPokemonDetails(pokemon.name))
      return await Promise.all(detailsPromises)
    }

    return []
  } catch (error) {
    console.error("Error in searchPokemon:", error)
    throw error
  }
}
