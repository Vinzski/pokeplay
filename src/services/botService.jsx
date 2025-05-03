import { fetchPokemonList, fetchPokemonDetails } from "./pokemonService"

// Generate a bot team based on difficulty and size
export const generateBotTeam = async (difficulty = "medium", size = 6) => {
  try {
    // Different Pokémon pools based on difficulty
    const difficultyRanges = {
      easy: { minBST: 200, maxBST: 350 }, // Weaker Pokémon
      medium: { minBST: 350, maxBST: 450 }, // Average Pokémon
      hard: { minBST: 450, maxBST: 550 }, // Strong Pokémon
      insane: { minBST: 550, maxBST: 800 }, // Legendary/powerful Pokémon
    }

    const range = difficultyRanges[difficulty] || difficultyRanges.medium

    // Get a large pool of Pokémon
    const { results } = await fetchPokemonList(500, 0)

    // Fetch details for random Pokémon until we have enough that match the BST range
    const team = []
    const usedIndices = new Set()

    while (team.length < size && usedIndices.size < results.length) {
      // Pick a random Pokémon we haven't tried yet
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * results.length)
      } while (usedIndices.has(randomIndex))

      usedIndices.add(randomIndex)

      try {
        const pokemon = await fetchPokemonDetails(results[randomIndex].name)

        // Calculate Base Stat Total (BST)
        const bst = pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)

        // If this Pokémon's BST is within our difficulty range, add it to the team
        if (bst >= range.minBST && bst <= range.maxBST) {
          team.push(pokemon)
        }

        // If we've found enough Pokémon, break out of the loop
        if (team.length >= size) break
      } catch (err) {
        console.error(`Error fetching Pokémon ${results[randomIndex].name}:`, err)
        // Continue to the next random Pokémon
      }
    }

    // If we couldn't find enough Pokémon in the BST range, fill with random ones
    if (team.length < size) {
      const remainingToFetch = size - team.length
      const remainingIndices = [...Array(results.length).keys()]
        .filter((i) => !usedIndices.has(i))
        .sort(() => Math.random() - 0.5)
        .slice(0, remainingToFetch)

      for (const index of remainingIndices) {
        try {
          const pokemon = await fetchPokemonDetails(results[index].name)
          team.push(pokemon)
        } catch (err) {
          console.error(`Error fetching Pokémon ${results[index].name}:`, err)
        }
      }
    }

    return team
  } catch (error) {
    console.error("Error in generateBotTeam:", error)
    throw error
  }
}
