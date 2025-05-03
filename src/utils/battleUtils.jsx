// Determine which Pokémon attacks first based on speed
export const determineFirstAttacker = (pokemon1, pokemon2) => {
    if (pokemon1.speed > pokemon2.speed) {
      return "player"
    } else if (pokemon2.speed > pokemon1.speed) {
      return "bot"
    } else {
      // If speeds are equal, randomly choose who goes first
      return Math.random() < 0.5 ? "player" : "bot"
    }
  }
  
  // Calculate damage based on attacker and defender stats
  export const calculateDamage = (attacker, defender) => {
    // Basic damage formula: (Attack / Defense) * Base Damage * Type Effectiveness * Random Factor
    const baseDamage = 20
    const attackValue = attacker.attack
    const defenseValue = defender.defense
  
    // Calculate type effectiveness (simplified)
    const typeEffectiveness = calculateTypeEffectiveness(attacker.types, defender.types)
  
    // Random factor between 0.85 and 1.15
    const randomFactor = 0.85 + Math.random() * 0.3
  
    // Calculate damage
    let damage = (attackValue / defenseValue) * baseDamage * typeEffectiveness * randomFactor
  
    // Ensure damage is at least 1
    damage = Math.max(1, Math.floor(damage))
  
    return damage
  }
  
  // Calculate type effectiveness multiplier
  export const calculateTypeEffectiveness = (attackerTypes, defenderTypes) => {
    // This is a simplified version of type effectiveness
    // In a full game, you'd implement the complete Pokémon type chart
  
    const typeChart = {
      normal: { weak: ["fighting"], resistant: [], immune: ["ghost"] },
      fire: {
        weak: ["water", "ground", "rock"],
        resistant: ["fire", "grass", "ice", "bug", "steel", "fairy"],
        immune: [],
      },
      water: { weak: ["electric", "grass"], resistant: ["fire", "water", "ice", "steel"], immune: [] },
      electric: { weak: ["ground"], resistant: ["electric", "flying", "steel"], immune: [] },
      grass: {
        weak: ["fire", "ice", "poison", "flying", "bug"],
        resistant: ["water", "ground", "grass", "electric"],
        immune: [],
      },
      ice: { weak: ["fire", "fighting", "rock", "steel"], resistant: ["ice"], immune: [] },
      fighting: { weak: ["flying", "psychic", "fairy"], resistant: ["bug", "rock", "dark"], immune: [] },
      poison: { weak: ["ground", "psychic"], resistant: ["grass", "fighting", "poison", "bug", "fairy"], immune: [] },
      ground: { weak: ["water", "grass", "ice"], resistant: ["poison", "rock"], immune: ["electric"] },
      flying: { weak: ["electric", "ice", "rock"], resistant: ["grass", "fighting", "bug"], immune: ["ground"] },
      psychic: { weak: ["bug", "ghost", "dark"], resistant: ["fighting", "psychic"], immune: [] },
      bug: { weak: ["fire", "flying", "rock"], resistant: ["grass", "fighting", "ground"], immune: [] },
      rock: {
        weak: ["water", "grass", "fighting", "ground", "steel"],
        resistant: ["normal", "fire", "poison", "flying"],
        immune: [],
      },
      ghost: { weak: ["ghost", "dark"], resistant: ["poison", "bug"], immune: ["normal", "fighting"] },
      dragon: { weak: ["ice", "dragon", "fairy"], resistant: ["fire", "water", "grass", "electric"], immune: [] },
      dark: { weak: ["fighting", "bug", "fairy"], resistant: ["ghost", "dark"], immune: ["psychic"] },
      steel: {
        weak: ["fire", "fighting", "ground"],
        resistant: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
        immune: ["poison"],
      },
      fairy: { weak: ["poison", "steel"], resistant: ["fighting", "bug", "dark"], immune: ["dragon"] },
    }
  
    let effectiveness = 1.0
  
    // Check each attacker type against each defender type
    for (const attackerType of attackerTypes) {
      for (const defenderType of defenderTypes) {
        const typeInfo = typeChart[attackerType]
  
        if (typeInfo) {
          // Check for immunity
          if (typeInfo.immune.includes(defenderType)) {
            return 0 // No damage if defender is immune
          }
  
          // Check for weakness
          if (typeInfo.weak.includes(defenderType)) {
            effectiveness *= 0.5 // Not very effective
          }
  
          // Check for resistance
          if (typeInfo.resistant.includes(defenderType)) {
            effectiveness *= 2.0 // Super effective
          }
        }
      }
    }
  
    return effectiveness
  }
  
  // Check if a team is completely fainted
  export const isTeamFainted = (team) => {
    return team.every((pokemon) => pokemon.isFainted)
  }
  
  // Get the next available Pokémon in a team
  export const getNextAvailablePokemon = (team, currentIndex) => {
    for (let i = 0; i < team.length; i++) {
      const index = (currentIndex + i + 1) % team.length
      if (!team[index].isFainted) {
        return index
      }
    }
    return -1 // No available Pokémon found
  }
  