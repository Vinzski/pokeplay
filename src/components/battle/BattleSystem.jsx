"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getUserTeam } from "../../services/teamService"
import { saveBattleResult } from "../../services/battleService"
import BattleOptions from "./BattleOptions"
import BattleSummary from "./BattleSummary"
import { generateBotTeam } from "../../services/botService"
import { toast } from "react-toastify"
import { calculateDamage, determineFirstAttacker } from "../../utils/battleUtils"
import { Bolt, X, Search, Play, Pause, Shield, Wind, Sun, CloudRain, Snowflake, Sparkles, Swords } from "lucide-react"
import { fetchPokemonList } from "../../services/pokemonService"

// Sound effects
const BATTLE_SOUNDS = {
  attack: new Audio("/sounds/attack.mp3"),
  victory: new Audio("/sounds/victory.mp3"),
  defeat: new Audio("/sounds/defeat.mp3"),
  faint: new Audio("/sounds/faint.mp3"),
}

// Pokemon abilities (simplified)
const POKEMON_ABILITIES = {
  overgrow: {
    name: "Overgrow",
    description: "Powers up Grass-type moves when HP is low",
    effect: "Increases damage of Grass-type moves by 50% when HP is below 30%",
  },
  blaze: {
    name: "Blaze",
    description: "Powers up Fire-type moves when HP is low",
    effect: "Increases damage of Fire-type moves by 50% when HP is below 30%",
  },
  torrent: {
    name: "Torrent",
    description: "Powers up Water-type moves when HP is low",
    effect: "Increases damage of Water-type moves by 50% when HP is below 30%",
  },
  guts: {
    name: "Guts",
    description: "Boosts Attack if there's a status problem",
    effect: "Increases Attack by 50% when affected by a status condition",
  },
  intimidate: {
    name: "Intimidate",
    description: "Lowers the foe's Attack stat",
    effect: "Reduces opponent's Attack by 20% when entering battle",
  },
  static: {
    name: "Static",
    description: "May paralyze the foe if it hits with a physical move",
    effect: "20% chance to paralyze opponent when hit by a physical move",
  },
  sturdy: {
    name: "Sturdy",
    description: "Cannot be knocked out with one hit",
    effect: "Prevents being knocked out from full HP",
  },
  levitate: {
    name: "Levitate",
    description: "Gives immunity to Ground-type moves",
    effect: "Immune to Ground-type moves",
  },
  chlorophyll: {
    name: "Chlorophyll",
    description: "Boosts Speed in sunshine",
    effect: "Increases Speed by 50% in sunny weather",
  },
  "swift-swim": {
    name: "Swift Swim",
    description: "Boosts Speed in rain",
    effect: "Increases Speed by 50% in rainy weather",
  },
}

// Battle effects
const BATTLE_EFFECTS = {
  critical: {
    name: "Critical Hit",
    description: "A critical hit!",
    effect: "Increases damage by 50%",
  },
  superEffective: {
    name: "Super Effective",
    description: "It's super effective!",
    effect: "Increases damage by 100%",
  },
  notEffective: {
    name: "Not Very Effective",
    description: "It's not very effective...",
    effect: "Reduces damage by 50%",
  },
  stab: {
    name: "STAB",
    description: "Same Type Attack Bonus",
    effect: "Increases damage by 50% when attack type matches Pokémon type",
  },
  dodge: {
    name: "Dodge",
    description: "The attack missed!",
    effect: "No damage is dealt",
  },
}

// Weather conditions
const WEATHER_CONDITIONS = [
  {
    name: "Clear",
    description: "Normal weather conditions",
    effect: "No special effects",
    icon: "Sun",
  },
  {
    name: "Sunny",
    description: "The sunlight is strong",
    effect: "Boosts Fire-type moves, weakens Water-type moves",
    icon: "Sun",
  },
  {
    name: "Rain",
    description: "It's raining",
    effect: "Boosts Water-type moves, weakens Fire-type moves",
    icon: "CloudRain",
  },
  {
    name: "Sandstorm",
    description: "A sandstorm is raging",
    effect: "Damages Pokémon except Rock, Ground, and Steel types",
    icon: "Wind",
  },
  {
    name: "Hail",
    description: "It's hailing",
    effect: "Damages Pokémon except Ice types",
    icon: "Snowflake",
  },
]

// List of Pokémon types
const POKEMON_TYPES = [
  "all",
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]

// Type colors for badges
const TYPE_COLORS = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-stone-500",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  steel: "bg-slate-400",
  fairy: "bg-pink-300",
}

function BattleSystem({ playerProfile, setPlayerProfile }) {
  const [playerTeam, setPlayerTeam] = useState([])
  const [botTeam, setBotTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [battleMode, setBattleMode] = useState(null) // 'vsBot' or 'simulation'
  const [difficulty, setDifficulty] = useState("medium")
  const [battleStarted, setBattleStarted] = useState(false)
  const [battleEnded, setBattleEnded] = useState(false)
  const [battleSummary, setBattleSummary] = useState(null)
  const [currentTurn, setCurrentTurn] = useState(null) // 'player' or 'bot'
  const [activePokemonIndices, setActivePokemonIndices] = useState({
    player: 0,
    bot: 0,
  })
  const [pokemonStats, setPokemonStats] = useState({
    player: [],
    bot: [],
  })
  const [battleLog, setBattleLog] = useState([])
  const [showingAttackAnimation, setShowingAttackAnimation] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  // Update the component state to include Pokémon selection
  const [battleStage, setBattleStage] = useState("setup") // "setup", "selection", "opponentSelection", "battle", "switchSelection", "ended"
  const [selectedStarterIndex, setSelectedStarterIndex] = useState(null)
  const [switchRequired, setSwitchRequired] = useState(false)
  const [availablePokemon, setAvailablePokemon] = useState([]) // For simulation mode opponent selection
  const [selectedOpponents, setSelectedOpponents] = useState([]) // For simulation mode
  const [autoAttack, setAutoAttack] = useState(false) // Auto attack mode
  const [autoAttackInterval, setAutoAttackInterval] = useState(null) // Interval for auto attacks
  const [searchTerm, setSearchTerm] = useState("") // For searching opponent Pokémon
  const [selectedType, setSelectedType] = useState("all") // For filtering opponent Pokémon
  const [currentWeather, setCurrentWeather] = useState(WEATHER_CONDITIONS[0]) // Current weather condition
  const [battleEffects, setBattleEffects] = useState([]) // Active battle effects
  const [loadingPokemon, setLoadingPokemon] = useState(false) // Loading state for Pokémon data
  const [attackAnimation, setAttackAnimation] = useState(null) // Animation state for attacks

  const battleLogRef = useRef(null)
  const navigate = useNavigate()

  // Load player team on component mount
  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true)
        const team = await getUserTeam()
        if (team.length === 0) {
          toast.error("You need to build a team first")
          navigate("/team")
          return
        }
        setPlayerTeam(team)
      } catch (error) {
        console.error("Error loading team:", error)
        toast.error("Failed to load your team")
      } finally {
        setLoading(false)
      }
    }

    loadTeam()
  }, [navigate])

  // Auto-scroll battle log to bottom when new entries are added
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight
    }
  }, [battleLog])

  // Auto attack logic
  useEffect(() => {
    if (autoAttack && battleStarted && !battleEnded && !showingAttackAnimation && !switchRequired) {
      const interval = setInterval(() => {
        if (currentTurn === "player") {
          handlePlayerAttack()
        }
      }, 2000) // Execute player attack every 2 seconds

      setAutoAttackInterval(interval)
      return () => clearInterval(interval)
    } else if (!autoAttack && autoAttackInterval) {
      clearInterval(autoAttackInterval)
      setAutoAttackInterval(null)
    }
  }, [autoAttack, battleStarted, battleEnded, showingAttackAnimation, switchRequired, currentTurn])

  // Bot auto attack logic
  useEffect(() => {
    // If it's bot's turn and battle has started, execute bot turn
    if (currentTurn === "bot" && battleStarted && !battleEnded && !showingAttackAnimation && !switchRequired) {
      const timer = setTimeout(() => {
        executeBotTurn()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [currentTurn, battleStarted, battleEnded, showingAttackAnimation, switchRequired])

  // Initialize battle with bot team or go to opponent selection for simulation
  const initializeBattle = async (mode, diff) => {
    try {
      setBattleMode(mode)

      if (mode === "simulation") {
        // For simulation mode, load available Pokémon for opponent selection
        setLoading(true)
        setLoadingPokemon(true)
        const { results } = await fetchPokemonList(500, 0)
        setAvailablePokemon(results)
        setBattleStage("opponentSelection")
        setLoadingPokemon(false)
        setLoading(false)
      } else {
        // For vsBot mode, generate bot team based on difficulty
        setDifficulty(diff)
        setLoading(true)
        setLoadingPokemon(true)
        const botTeam = await generateBotTeam(diff, playerTeam.length)
        setBotTeam(botTeam)

        // Initialize pokemon stats for battle
        initializeStats(playerTeam, botTeam)
        setLoadingPokemon(false)

        // Set battle to selection stage
        setBattleStage("selection")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error initializing battle:", error)
      toast.error("Failed to initialize battle")
      setLoading(false)
      setLoadingPokemon(false)
    }
  }

  // Initialize stats for both teams
  const initializeStats = (playerTeam, botTeam) => {
    // Randomly select a weather condition
    const randomWeather = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)]
    setCurrentWeather(randomWeather)

    const playerStats = playerTeam.map((pokemon) => {
      // Assign random abilities to Pokémon
      const abilityKeys = Object.keys(POKEMON_ABILITIES)
      const randomAbility = POKEMON_ABILITIES[abilityKeys[Math.floor(Math.random() * abilityKeys.length)]]

      return {
        id: pokemon.id,
        name: pokemon.name,
        currentHp: pokemon.stats[0].base_stat,
        maxHp: pokemon.stats[0].base_stat,
        attack: pokemon.stats[1].base_stat,
        defense: pokemon.stats[2].base_stat,
        speed: pokemon.stats[5].base_stat,
        types: pokemon.types.map((t) => t.type.name),
        isFainted: false,
        ability: randomAbility,
        status: null, // No status condition initially
        critRate: 0.06, // 6% chance for critical hit
        evasion: 0.05, // 5% chance to dodge attacks
      }
    })

    const botStats = botTeam.map((pokemon) => {
      // Assign random abilities to Pokémon
      const abilityKeys = Object.keys(POKEMON_ABILITIES)
      const randomAbility = POKEMON_ABILITIES[abilityKeys[Math.floor(Math.random() * abilityKeys.length)]]

      return {
        id: pokemon.id,
        name: pokemon.name,
        currentHp: pokemon.stats[0].base_stat,
        maxHp: pokemon.stats[0].base_stat,
        attack: pokemon.stats[1].base_stat,
        defense: pokemon.stats[2].base_stat,
        speed: pokemon.stats[5].base_stat,
        types: pokemon.types.map((t) => t.type.name),
        isFainted: false,
        ability: randomAbility,
        status: null, // No status condition initially
        critRate: 0.06, // 6% chance for critical hit
        evasion: 0.05, // 5% chance to dodge attacks
      }
    })

    setPokemonStats({
      player: playerStats,
      bot: botStats,
    })

    // Reset battle state
    setBattleStarted(false)
    setBattleEnded(false)
    setBattleSummary(null)
    setActivePokemonIndices({
      player: 0,
      bot: 0,
    })
    setBattleLog([
      {
        message: `Battle is ready!${difficulty ? ` Difficulty: ${difficulty.toUpperCase()}` : ""}`,
        type: "info",
      },
      {
        message: `Weather: ${randomWeather.name} - ${randomWeather.description}`,
        type: "weather",
      },
    ])
  }

  // Handle opponent selection for simulation mode
  const handleOpponentSelection = async () => {
    if (selectedOpponents.length === 0) {
      toast.warning("Please select at least one opponent Pokémon")
      return
    }

    try {
      setLoading(true)
      setLoadingPokemon(true)
      // Fetch details for selected opponents
      const opponentTeam = await Promise.all(
        selectedOpponents.map(async (pokemon) => {
          const response = await fetch(pokemon.url)
          return await response.json()
        }),
      )

      setBotTeam(opponentTeam)

      // Initialize stats for both teams
      initializeStats(playerTeam, opponentTeam)
      setLoadingPokemon(false)

      // Move to starter selection
      setBattleStage("selection")
      setLoading(false)
    } catch (error) {
      console.error("Error loading opponent team:", error)
      toast.error("Failed to load opponent team")
      setLoading(false)
      setLoadingPokemon(false)
    }
  }

  // Toggle opponent selection
  const toggleOpponentSelection = (pokemon) => {
    if (selectedOpponents.some((p) => p.name === pokemon.name)) {
      setSelectedOpponents(selectedOpponents.filter((p) => p.name !== pokemon.name))
    } else if (selectedOpponents.length < 6) {
      setSelectedOpponents([...selectedOpponents, pokemon])
    } else {
      toast.warning("You can only select up to 6 opponent Pokémon")
    }
  }

  // Filter opponent Pokémon by search term and type
  const getFilteredOpponents = () => {
    if (!availablePokemon.length) return []

    let filtered = [...availablePokemon]

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term) || p.url.split("/")[6].includes(term))
    }

    return filtered
  }

  // Add a function to handle the starter Pokémon selection
  const handleSelectStarter = (index) => {
    setSelectedStarterIndex(index)
  }

  // Modify startBattle to use the selected Pokémon and randomly choose bot's starter
  const startBattle = () => {
    // Ensure a Pokémon has been selected
    if (selectedStarterIndex === null && battleStage === "selection") {
      toast.warning("Please select a Pokémon to start the battle")
      return
    }

    setBattleStarted(true)
    setBattleStage("battle")

    // Set player's active Pokémon based on selection
    const playerStarterIndex = selectedStarterIndex

    // Randomly select a starter for the bot
    const botStarterIndex = Math.floor(Math.random() * botTeam.length)

    // Update active Pokémon indices
    setActivePokemonIndices({
      player: playerStarterIndex,
      bot: botStarterIndex,
    })

    const playerPokemon = pokemonStats.player[playerStarterIndex]
    const botPokemon = pokemonStats.bot[botStarterIndex]

    // Apply ability effects at the start of battle
    applyAbilityEffects("player", "bot", playerPokemon, botPokemon)

    setBattleLog((prev) => [
      ...prev,
      {
        message: "Battle has started!",
        type: "system",
      },
      {
        message: `You chose ${playerPokemon.name} to start the battle!`,
        type: "player",
      },
      {
        message: `${playerPokemon.name}'s ability: ${playerPokemon.ability.name} - ${playerPokemon.ability.description}`,
        type: "ability",
      },
      {
        message: `Bot sends out ${botPokemon.name}!`,
        type: "bot",
      },
      {
        message: `${botPokemon.name}'s ability: ${botPokemon.ability.name} - ${botPokemon.ability.description}`,
        type: "ability",
      },
    ])

    // Determine first attacker based on speed
    const firstAttacker = determineFirstAttacker(playerPokemon, botPokemon)
    setCurrentTurn(firstAttacker)

    setBattleLog((prev) => [
      ...prev,
      {
        message: `${firstAttacker === "player" ? playerPokemon.name : botPokemon.name} goes first!`,
        type: "system",
      },
    ])
  }

  // Apply ability effects at the start of battle
  const applyAbilityEffects = (attacker, defender, attackerPokemon, defenderPokemon) => {
    const updatedStats = { ...pokemonStats }

    // Apply intimidate ability
    if (attackerPokemon.ability.name === "Intimidate") {
      updatedStats[defender][activePokemonIndices[defender]].attack *= 0.8
      setBattleLog((prev) => [
        ...prev,
        {
          message: `${attackerPokemon.name}'s Intimidate lowered ${defenderPokemon.name}'s Attack!`,
          type: "ability",
        },
      ])
    }

    // Apply weather-based abilities
    if (currentWeather.name === "Sunny" && attackerPokemon.ability.name === "Chlorophyll") {
      updatedStats[attacker][activePokemonIndices[attacker]].speed *= 1.5
      setBattleLog((prev) => [
        ...prev,
        {
          message: `${attackerPokemon.name}'s Chlorophyll increased its Speed in the sunshine!`,
          type: "ability",
        },
      ])
    }

    if (currentWeather.name === "Rain" && attackerPokemon.ability.name === "Swift Swim") {
      updatedStats[attacker][activePokemonIndices[attacker]].speed *= 1.5
      setBattleLog((prev) => [
        ...prev,
        {
          message: `${attackerPokemon.name}'s Swift Swim increased its Speed in the rain!`,
          type: "ability",
        },
      ])
    }

    setPokemonStats(updatedStats)
  }

  // Handle player attack
  const handlePlayerAttack = () => {
    if (currentTurn !== "player" || showingAttackAnimation) return

    executeAttack("player", "bot")
  }

  // Execute bot turn automatically
  const executeBotTurn = () => {
    if (currentTurn !== "bot" || battleEnded || showingAttackAnimation || switchRequired) return

    executeAttack("bot", "player")
  }

  // Toggle auto attack mode
  const toggleAutoAttack = () => {
    setAutoAttack(!autoAttack)
    toast.info(autoAttack ? "Auto Attack disabled" : "Auto Attack enabled")
  }

  // Execute attack logic with enhanced battle mechanics
  const executeAttack = (attacker, defender) => {
    setShowingAttackAnimation(true)
    setAttackAnimation({
      attacker,
      defender,
      type: "attack",
    })

    const attackerIndex = activePokemonIndices[attacker]
    const defenderIndex = activePokemonIndices[defender]

    const attackerPokemon = pokemonStats[attacker][attackerIndex]
    const defenderPokemon = pokemonStats[defender][defenderIndex]

    // Check for dodge (evasion)
    const dodged = Math.random() < defenderPokemon.evasion
    if (dodged) {
      setBattleLog((prev) => [
        ...prev,
        {
          message: `${defenderPokemon.name} dodged ${attackerPokemon.name}'s attack!`,
          type: "battle",
        },
      ])

      setAttackAnimation({
        attacker,
        defender,
        type: "dodge",
      })

      setTimeout(() => {
        setShowingAttackAnimation(false)
        setAttackAnimation(null)
        // Switch turns
        const nextTurn = attacker === "player" ? "bot" : "player"
        setCurrentTurn(nextTurn)
      }, 1000)

      return
    }

    // Check for critical hit
    const isCritical = Math.random() < attackerPokemon.critRate
    const criticalMultiplier = isCritical ? 1.5 : 1

    // Calculate type effectiveness
    const typeEffectiveness = calculateTypeEffectiveness(attackerPokemon.types[0], defenderPokemon.types)
    let effectivenessMultiplier = 1
    let effectivenessMessage = ""

    if (typeEffectiveness > 1) {
      effectivenessMultiplier = 2
      effectivenessMessage = "It's super effective!"
      setBattleEffects([...battleEffects, BATTLE_EFFECTS.superEffective])
    } else if (typeEffectiveness < 1) {
      effectivenessMultiplier = 0.5
      effectivenessMessage = "It's not very effective..."
      setBattleEffects([...battleEffects, BATTLE_EFFECTS.notEffective])
    }

    // Check for STAB (Same Type Attack Bonus)
    const hasStab = attackerPokemon.types.includes(attackerPokemon.types[0])
    const stabMultiplier = hasStab ? 1.5 : 1

    // Apply ability effects
    let abilityMultiplier = 1
    let abilityMessage = ""

    // Low HP abilities (Blaze, Overgrow, Torrent)
    if (attackerPokemon.currentHp < attackerPokemon.maxHp * 0.3) {
      if (
        (attackerPokemon.ability.name === "Blaze" && attackerPokemon.types.includes("fire")) ||
        (attackerPokemon.ability.name === "Overgrow" && attackerPokemon.types.includes("grass")) ||
        (attackerPokemon.ability.name === "Torrent" && attackerPokemon.types.includes("water"))
      ) {
        abilityMultiplier = 1.5
        abilityMessage = `${attackerPokemon.name}'s ${attackerPokemon.ability.name} boosted its attack!`
      }
    }

    // Apply weather effects
    let weatherMultiplier = 1
    let weatherMessage = ""

    if (currentWeather.name === "Sunny" && attackerPokemon.types.includes("fire")) {
      weatherMultiplier = 1.5
      weatherMessage = "The sunlight strengthened the Fire-type move!"
    } else if (currentWeather.name === "Sunny" && attackerPokemon.types.includes("water")) {
      weatherMultiplier = 0.5
      weatherMessage = "The sunlight weakened the Water-type move!"
    } else if (currentWeather.name === "Rain" && attackerPokemon.types.includes("water")) {
      weatherMultiplier = 1.5
      weatherMessage = "The rain strengthened the Water-type move!"
    } else if (currentWeather.name === "Rain" && attackerPokemon.types.includes("fire")) {
      weatherMultiplier = 0.5
      weatherMessage = "The rain weakened the Fire-type move!"
    }

    // Calculate final damage
    const baseDamage = calculateDamage(attackerPokemon, defenderPokemon)
    const finalDamage = Math.floor(
      baseDamage *
        criticalMultiplier *
        effectivenessMultiplier *
        stabMultiplier *
        abilityMultiplier *
        weatherMultiplier,
    )

    // Play attack sound
    if (soundEnabled) {
      BATTLE_SOUNDS.attack.currentTime = 0
      BATTLE_SOUNDS.attack.play()
    }

    // Update defender's HP
    const updatedStats = { ...pokemonStats }
    updatedStats[defender][defenderIndex].currentHp = Math.max(0, defenderPokemon.currentHp - finalDamage)

    // Check if defender fainted
    const hasFainted = updatedStats[defender][defenderIndex].currentHp === 0
    if (hasFainted) {
      updatedStats[defender][defenderIndex].isFainted = true

      // Play faint sound
      if (soundEnabled) {
        BATTLE_SOUNDS.faint.currentTime = 0
        BATTLE_SOUNDS.faint.play()
      }
    }

    setPokemonStats(updatedStats)

    // Add to battle log
    setBattleLog((prev) => [
      ...prev,
      {
        message: `${attackerPokemon.name} attacked ${defenderPokemon.name} for ${finalDamage} damage!`,
        type: attacker,
      },
    ])

    if (isCritical) {
      setBattleLog((prev) => [
        ...prev,
        {
          message: "A critical hit!",
          type: "battle",
        },
      ])
    }

    if (effectivenessMessage) {
      setBattleLog((prev) => [
        ...prev,
        {
          message: effectivenessMessage,
          type: "battle",
        },
      ])
    }

    if (abilityMessage) {
      setBattleLog((prev) => [
        ...prev,
        {
          message: abilityMessage,
          type: "ability",
        },
      ])
    }

    if (weatherMessage) {
      setBattleLog((prev) => [
        ...prev,
        {
          message: weatherMessage,
          type: "weather",
        },
      ])
    }

    if (hasFainted) {
      setBattleLog((prev) => [
        ...prev,
        {
          message: `${defenderPokemon.name} fainted!`,
          type: "system",
        },
      ])
    }

    // Delay to show animation
    setTimeout(() => {
      setShowingAttackAnimation(false)
      setAttackAnimation(null)
      setBattleEffects([]) // Clear battle effects

      // Check if battle should end
      const remainingDefenderPokemon = updatedStats[defender].filter((p) => !p.isFainted && p.currentHp > 0)

      if (remainingDefenderPokemon.length === 0) {
        // All defender's Pokémon have fainted, battle ends
        endBattle(attacker)
      } else if (hasFainted) {
        // Current defender Pokémon fainted, prompt for switch
        if (defender === "player") {
          // Player needs to choose next Pokémon
          setSwitchRequired(true)
          setBattleStage("switchSelection")
          setBattleLog((prev) => [
            ...prev,
            {
              message: "Choose your next Pokémon!",
              type: "system",
            },
          ])
        } else {
          // Bot automatically chooses next Pokémon
          const availableBotPokemon = updatedStats.bot.filter((p) => !p.isFainted)
          const nextBotIndex = updatedStats.bot.findIndex((p) => !p.isFainted && p.id !== botTeam[defenderIndex].id)

          setActivePokemonIndices((prev) => ({
            ...prev,
            bot: nextBotIndex,
          }))

          setBattleLog((prev) => [
            ...prev,
            {
              message: `Bot sent out ${updatedStats.bot[nextBotIndex].name}!`,
              type: "bot",
            },
            {
              message: `${updatedStats.bot[nextBotIndex].name}'s ability: ${updatedStats.bot[nextBotIndex].ability.name} - ${updatedStats.bot[nextBotIndex].ability.description}`,
              type: "ability",
            },
          ])

          // Apply ability effects for the new Pokémon
          applyAbilityEffects(
            "bot",
            "player",
            updatedStats.bot[nextBotIndex],
            updatedStats.player[activePokemonIndices.player],
          )

          // Keep the same attacker's turn
          setTimeout(() => {
            if (attacker === "bot" && battleMode === "vsBot") {
              executeBotTurn()
            }
          }, 1000)
        }
      } else {
        // Switch turns
        const nextTurn = attacker === "player" ? "bot" : "player"
        setCurrentTurn(nextTurn)
      }
    }, 1000)
  }

  // Calculate type effectiveness
  const calculateTypeEffectiveness = (attackType, defenderTypes) => {
    // Simplified type chart
    const typeChart = {
      normal: { weakTo: ["fighting"], resistantTo: [], immuneTo: ["ghost"] },
      fire: {
        weakTo: ["water", "ground", "rock"],
        resistantTo: ["fire", "grass", "ice", "bug", "steel", "fairy"],
        immuneTo: [],
      },
      water: {
        weakTo: ["electric", "grass"],
        resistantTo: ["fire", "water", "ice", "steel"],
        immuneTo: [],
      },
      electric: {
        weakTo: ["ground"],
        resistantTo: ["electric", "flying", "steel"],
        immuneTo: [],
      },
      grass: {
        weakTo: ["fire", "ice", "poison", "flying", "bug"],
        resistantTo: ["water", "ground", "grass", "electric"],
        immuneTo: [],
      },
      ice: {
        weakTo: ["fire", "fighting", "rock", "steel"],
        resistantTo: ["ice"],
        immuneTo: [],
      },
      fighting: {
        weakTo: ["flying", "psychic", "fairy"],
        resistantTo: ["bug", "rock", "dark"],
        immuneTo: [],
      },
      poison: {
        weakTo: ["ground", "psychic"],
        resistantTo: ["grass", "fighting", "poison", "bug", "fairy"],
        immuneTo: [],
      },
      ground: {
        weakTo: ["water", "grass", "ice"],
        resistantTo: ["poison", "rock"],
        immuneTo: ["electric"],
      },
      flying: {
        weakTo: ["electric", "ice", "rock"],
        resistantTo: ["grass", "fighting", "bug"],
        immuneTo: ["ground"],
      },
      psychic: {
        weakTo: ["bug", "ghost", "dark"],
        resistantTo: ["fighting", "psychic"],
        immuneTo: [],
      },
      bug: {
        weakTo: ["fire", "flying", "rock"],
        resistantTo: ["grass", "fighting", "ground"],
        immuneTo: [],
      },
      rock: {
        weakTo: ["water", "grass", "fighting", "ground", "steel"],
        resistantTo: ["normal", "fire", "poison", "flying"],
        immuneTo: [],
      },
      ghost: {
        weakTo: ["ghost", "dark"],
        resistantTo: ["poison", "bug"],
        immuneTo: ["normal", "fighting"],
      },
      dragon: {
        weakTo: ["ice", "dragon", "fairy"],
        resistantTo: ["fire", "water", "grass", "electric"],
        immuneTo: [],
      },
      dark: {
        weakTo: ["fighting", "bug", "fairy"],
        resistantTo: ["ghost", "dark"],
        immuneTo: ["psychic"],
      },
      steel: {
        weakTo: ["fire", "fighting", "ground"],
        resistantTo: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
        immuneTo: ["poison"],
      },
      fairy: {
        weakTo: ["poison", "steel"],
        resistantTo: ["fighting", "bug", "dark"],
        immuneTo: ["dragon"],
      },
    }

    let effectiveness = 1.0

    // Check if attack type exists in our chart
    if (!typeChart[attackType]) return effectiveness

    // Check against each defender type
    for (const defenderType of defenderTypes) {
      // Skip if defender type doesn't exist in our chart
      if (!typeChart[defenderType]) continue

      // Check for immunity
      if (typeChart[defenderType].immuneTo.includes(attackType)) {
        return 0 // No damage if defender is immune
      }

      // Check for weakness
      if (typeChart[defenderType].weakTo.includes(attackType)) {
        effectiveness *= 2.0 // Super effective
      }

      // Check for resistance
      if (typeChart[defenderType].resistantTo.includes(attackType)) {
        effectiveness *= 0.5 // Not very effective
      }
    }

    return effectiveness
  }

  // Handle Pokémon switch after knockout
  const handleSwitchPokemon = (index) => {
    if (!switchRequired) return

    const newActivePokemon = pokemonStats.player[index]

    if (newActivePokemon.isFainted) {
      toast.warning("This Pokémon has fainted and cannot battle!")
      return
    }

    setActivePokemonIndices((prev) => ({
      ...prev,
      player: index,
    }))

    setBattleLog((prev) => [
      ...prev,
      {
        message: `You sent out ${newActivePokemon.name}!`,
        type: "player",
      },
      {
        message: `${newActivePokemon.name}'s ability: ${newActivePokemon.ability.name} - ${newActivePokemon.ability.description}`,
        type: "ability",
      },
    ])

    // Apply ability effects for the new Pokémon
    applyAbilityEffects("player", "bot", newActivePokemon, pokemonStats.bot[activePokemonIndices.bot])

    setSwitchRequired(false)
    setBattleStage("battle")

    // After switching, it's the bot's turn
    setCurrentTurn("bot")
  }

  // End battle logic
  const endBattle = async (winner) => {
    setBattleEnded(true)

    // Play victory/defeat sound
    if (soundEnabled) {
      if (winner === "player") {
        BATTLE_SOUNDS.victory.play()
      } else {
        BATTLE_SOUNDS.defeat.play()
      }
    }

    // Create battle summary
    const summary = {
      winner: winner,
      date: new Date().toISOString(),
      playerTeam: playerTeam.map((pokemon, index) => ({
        id: pokemon.id,
        name: pokemon.name,
        remaining_hp: pokemonStats.player[index].currentHp,
        max_hp: pokemonStats.player[index].maxHp,
      })),
      botTeam: botTeam.map((pokemon, index) => ({
        id: pokemon.id,
        name: pokemon.name,
        remaining_hp: pokemonStats.bot[index].currentHp,
        max_hp: pokemonStats.bot[index].maxHp,
      })),
      difficulty: difficulty,
      mode: battleMode,
    }

    setBattleSummary(summary)

    // Save battle result to JSON server
    try {
      await saveBattleResult(summary)

      // Update player profile with new battle stats
      if (playerProfile) {
        const updatedProfile = {
          ...playerProfile,
          totalBattles: (playerProfile.totalBattles || 0) + 1,
          wins: winner === "player" ? (playerProfile.wins || 0) + 1 : playerProfile.wins || 0,
          losses: winner === "bot" ? (playerProfile.losses || 0) + 1 : playerProfile.losses || 0,
        }
        setPlayerProfile(updatedProfile)
      }
    } catch (error) {
      console.error("Error saving battle result:", error)
    }

    setBattleLog((prev) => [
      ...prev,
      {
        message: `Battle ended! ${winner === "player" ? "You won!" : "Bot won!"}`,
        type: "system",
      },
    ])
  }

  // Reset battle
  const resetBattle = () => {
    setBattleStarted(false)
    setBattleEnded(false)
    setBattleSummary(null)
    setBattleMode(null)
    setBattleStage("setup")
    setSelectedOpponents([])
    setAutoAttack(false)
    if (autoAttackInterval) {
      clearInterval(autoAttackInterval)
      setAutoAttackInterval(null)
    }
  }

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  // Handle search for opponent selection
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle type filter for opponent selection
  const handleTypeFilter = (type) => {
    setSelectedType(type)
  }

  // Get the appropriate weather icon
  const getWeatherIcon = () => {
    switch (currentWeather.name) {
      case "Sunny":
        return <Sun className="h-5 w-5 text-yellow-400" />
      case "Rain":
        return <CloudRain className="h-5 w-5 text-blue-400" />
      case "Sandstorm":
        return <Wind className="h-5 w-5 text-amber-400" />
      case "Hail":
        return <Snowflake className="h-5 w-5 text-blue-200" />
      default:
        return <Sun className="h-5 w-5 text-yellow-400" />
    }
  }

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    return TYPE_COLORS[type] || "bg-gray-500"
  }

  if (loading && !loadingPokemon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Loading battle system...</p>
      </div>
    )
  }

  if (!battleMode) {
    return <BattleOptions onSelectMode={initializeBattle} />
  }

  if (battleSummary) {
    return <BattleSummary summary={battleSummary} onNewBattle={resetBattle} />
  }

  // Loading screen while Pokémon are being loaded
  if (loadingPokemon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Loading Pokémon data...</p>
        <p className="text-gray-400 mt-2">Preparing for battle...</p>
      </div>
    )
  }

  // Opponent Selection Screen for Simulation Mode
  if (battleStage === "opponentSelection") {
    const filteredOpponents = getFilteredOpponents()

    return (
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            Choose Opponent Pokémon
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                soundEnabled
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {soundEnabled ? "Sound: ON" : "Sound: OFF"}
            </button>
            <button
              onClick={resetBattle}
              className="px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              Change Mode
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Select up to 6 Pokémon for your opponent's team
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search Pokémon by name or ID..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div>
              <select
                value={selectedType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {POKEMON_TYPES.slice(1).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-lg text-white">
              Selected: <span className="font-bold text-blue-400">{selectedOpponents.length}/6</span>
            </div>
            <button
              onClick={handleOpponentSelection}
              disabled={selectedOpponents.length === 0}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                selectedOpponents.length === 0
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"
              }`}
            >
              Continue with {selectedOpponents.length} Pokémon
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {filteredOpponents.map((pokemon) => (
              <div
                key={`opponent-${pokemon.name}`}
                onClick={() => toggleOpponentSelection(pokemon)}
                className={`cursor-pointer transition-all duration-200 
                  ${
                    selectedOpponents.some((p) => p.name === pokemon.name) ? "transform scale-105" : "hover:scale-105"
                  }`}
              >
                <div
                  className={`relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden p-3 border-2 ${
                    selectedOpponents.some((p) => p.name === pokemon.name)
                      ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      : "border-gray-700"
                  }`}
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                      pokemon.url.split("/")[6]
                    }.png`}
                    alt={pokemon.name}
                    className="w-full h-24 object-contain mx-auto"
                  />
                  {selectedOpponents.some((p) => p.name === pokemon.name) && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <X className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="text-center mt-2">
                    <h3 className="text-sm font-semibold capitalize text-white">{pokemon.name}</h3>
                    <div className="text-xs text-gray-400">#{pokemon.url.split("/")[6]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Pokémon Selection Screen
  if (battleStage === "selection") {
    return (
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            Choose Your Starting Pokémon
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                soundEnabled
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {soundEnabled ? "Sound: ON" : "Sound: OFF"}
            </button>
            <button
              onClick={resetBattle}
              className="px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              Change Mode
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Select a Pokémon to lead your team into battle
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {pokemonStats.player.map((pokemon, index) => (
              <div
                key={`select-${pokemon.id}`}
                onClick={() => handleSelectStarter(index)}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedStarterIndex === index ? "transform scale-105" : "hover:scale-105"
                }`}
              >
                <div
                  className={`pokemon-card relative overflow-hidden rounded-xl ${
                    selectedStarterIndex === index ? "ring-4 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : ""
                  }`}
                >
                  {/* Card background with gradient based on Pokémon type */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${
                      pokemon.types[0] === "fire"
                        ? "from-red-900 to-orange-900"
                        : pokemon.types[0] === "water"
                          ? "from-blue-900 to-cyan-900"
                          : pokemon.types[0] === "grass"
                            ? "from-green-900 to-emerald-900"
                            : pokemon.types[0] === "electric"
                              ? "from-yellow-700 to-amber-900"
                              : "from-gray-800 to-gray-900"
                    } opacity-50`}
                  ></div>

                  {/* Card content */}
                  <div className="relative p-4">
                    <div className="flex justify-center mb-2">
                      {pokemon.types.map((type, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full text-white mr-1 ${getTypeBadgeColor(type)}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="bg-black/30 rounded-full p-2 mb-2">
                      <img
                        src={playerTeam[index]?.sprites?.front_default || "/placeholder.svg" || "/placeholder.svg"}
                        alt={pokemon.name}
                        className="w-full h-32 object-contain mx-auto"
                      />
                    </div>

                    <div className="p-2 text-center">
                      <h3 className="text-lg font-bold capitalize text-white mb-2">{pokemon.name}</h3>

                      <div className="grid grid-cols-2 gap-2 text-xs text-white mb-2">
                        <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-red-400 font-semibold">HP</span>
                          <span>{pokemon.maxHp}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-orange-400 font-semibold">ATK</span>
                          <span>{pokemon.attack}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-blue-400 font-semibold">DEF</span>
                          <span>{pokemon.defense}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-green-400 font-semibold">SPD</span>
                          <span>{pokemon.speed}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-purple-300 bg-purple-900/50 rounded-lg p-2">
                        <span className="font-semibold">Ability:</span> {pokemon.ability.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={startBattle}
              disabled={selectedStarterIndex === null}
              className={`px-8 py-4 rounded-xl text-xl font-bold transition-all ${
                selectedStarterIndex === null
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-purple-600 text-white hover:from-red-600 hover:to-purple-700 transform hover:scale-105 shadow-lg"
              }`}
            >
              Start Battle
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Switch Selection Screen after a Pokémon faints
  if (battleStage === "switchSelection") {
    return (
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            Choose Your Next Pokémon
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                soundEnabled
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {soundEnabled ? "Sound: ON" : "Sound: OFF"}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-400">
            Your Pokémon fainted! Choose your next Pokémon
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {pokemonStats.player.map((pokemon, index) => (
              <div
                key={`switch-${pokemon.id}`}
                onClick={() => !pokemon.isFainted && handleSwitchPokemon(index)}
                className={`cursor-pointer transition-all duration-300 ${
                  pokemon.isFainted ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-105"
                }`}
              >
                <div
                  className={`pokemon-card relative overflow-hidden rounded-xl ${
                    pokemon.isFainted ? "ring-2 ring-gray-600" : "ring-2 ring-gray-700 hover:ring-blue-500"
                  }`}
                >
                  {/* Card background with gradient based on Pokémon type */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${
                      pokemon.types[0] === "fire"
                        ? "from-red-900 to-orange-900"
                        : pokemon.types[0] === "water"
                          ? "from-blue-900 to-cyan-900"
                          : pokemon.types[0] === "grass"
                            ? "from-green-900 to-emerald-900"
                            : pokemon.types[0] === "electric"
                              ? "from-yellow-700 to-amber-900"
                              : "from-gray-800 to-gray-900"
                    } opacity-50`}
                  ></div>

                  {/* Card content */}
                  <div className="relative p-4">
                    <div className="flex justify-center mb-2">
                      {pokemon.types.map((type, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full text-white mr-1 ${getTypeBadgeColor(type)}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="bg-black/30 rounded-full p-2 mb-2">
                      <img
                        src={playerTeam[index]?.sprites?.front_default || "/placeholder.svg" || "/placeholder.svg"}
                        alt={pokemon.name}
                        className="w-full h-32 object-contain mx-auto"
                      />
                    </div>

                    <div className="p-2 text-center">
                      <h3 className="text-lg font-bold capitalize text-white mb-2">{pokemon.name}</h3>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-white mb-1">
                          <span>HP</span>
                          <span>
                            {pokemon.currentHp}/{pokemon.maxHp}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              pokemon.currentHp / pokemon.maxHp > 0.5
                                ? "bg-green-500"
                                : pokemon.currentHp / pokemon.maxHp > 0.2
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${(pokemon.currentHp / pokemon.maxHp) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-white mb-2">
                        <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-orange-400 font-semibold">ATK</span>
                          <span>{pokemon.attack}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-blue-400 font-semibold">DEF</span>
                          <span>{pokemon.defense}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-green-400 font-semibold">SPD</span>
                          <span>{pokemon.speed}</span>
                        </div>
                      </div>

                      {pokemon.isFainted ? (
                        <div className="mt-2 text-sm font-bold text-red-500 bg-red-900/30 rounded-lg p-2">FAINTED</div>
                      ) : (
                        <div className="mt-2 text-xs text-purple-300 bg-purple-900/50 rounded-lg p-2">
                          <span className="font-semibold">Ability:</span> {pokemon.ability.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const botActivePokemon = pokemonStats.bot[activePokemonIndices.bot]
  const playerActivePokemon = pokemonStats.player[activePokemonIndices.player]

  // Battle Screen - Card Game Style
  return (
    <div className="container mx-auto px-4 min-h-screen flex flex-col">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
          Battle Arena
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleAutoAttack}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              autoAttack ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {autoAttack ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {autoAttack ? "Auto: ON" : "Auto: OFF"}
          </button>
          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              soundEnabled
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {soundEnabled ? "Sound: ON" : "Sound: OFF"}
          </button>
          <button
            onClick={resetBattle}
            className="px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            Change Mode
          </button>
        </div>
      </div>

      {/* Weather Indicator */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 rounded-xl mb-4 flex items-center justify-center gap-2 border border-gray-700">
        {getWeatherIcon()}
        <span className="text-yellow-400 font-medium">{currentWeather.name}</span>
        <span className="text-gray-300 ml-1 hidden md:inline">- {currentWeather.description}</span>
      </div>

      {/* Card Game Style Battlefield */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] flex-grow flex flex-col border border-gray-700">
        {/* Turn Indicator */}
        <div className="text-center mb-4">
          <div className="inline-block bg-gradient-to-r from-gray-800 to-gray-700 rounded-full px-6 py-2 shadow-inner border border-gray-600">
            <div className="flex justify-center items-center space-x-6">
              <span
                className={`text-lg font-bold transition-all duration-300 ${
                  currentTurn === "player" ? "text-green-400 scale-110" : "text-gray-400"
                }`}
              >
                You
              </span>
              <span className="text-yellow-500 font-bold">VS</span>
              <span
                className={`text-lg font-bold transition-all duration-300 ${
                  currentTurn === "bot" ? "text-red-400 scale-110" : "text-gray-400"
                }`}
              >
                Bot
              </span>
            </div>
          </div>
        </div>

        {/* Card Game Layout */}
        <div className="grid grid-rows-[auto_1fr_auto] gap-4 flex-grow">
          {/* Bot's Side */}
          <div className="flex flex-col items-center">
            {/* Bot's Bench */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {pokemonStats.bot.map((pokemon, index) => (
                <div
                  key={`bot-bench-${pokemon.id}`}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center 
                    ${pokemon.isFainted ? "bg-gray-800/50 opacity-50 grayscale" : "bg-gray-800/80"}
                    ${
                      index === activePokemonIndices.bot
                        ? "ring-2 ring-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                        : "ring-1 ring-gray-700"
                    }`}
                >
                  <img
                    src={botTeam[index]?.sprites?.front_default || "/placeholder.svg" || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="w-10 h-10"
                  />
                </div>
              ))}
            </div>

            {/* Bot's Active Pokémon */}
            <div
              className={`relative ${
                showingAttackAnimation && currentTurn === "player" && attackAnimation?.type === "attack"
                  ? "animate-[shake_0.5s_ease-in-out]"
                  : showingAttackAnimation && currentTurn === "player" && attackAnimation?.type === "dodge"
                    ? "animate-[bounce_0.5s_ease-in-out]"
                    : ""
              }`}
            >
              {botActivePokemon && (
                <div className="transform transition-transform duration-300 hover:scale-105">
                  <div
                    className={`relative w-full max-w-xs mx-auto overflow-hidden rounded-2xl ${
                      currentTurn === "bot" ? "shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "shadow-lg"
                    }`}
                  >
                    {/* Card background with gradient based on Pokémon type */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${
                        botActivePokemon.types[0] === "fire"
                          ? "from-red-900 to-orange-900"
                          : botActivePokemon.types[0] === "water"
                            ? "from-blue-900 to-cyan-900"
                            : botActivePokemon.types[0] === "grass"
                              ? "from-green-900 to-emerald-900"
                              : botActivePokemon.types[0] === "electric"
                                ? "from-yellow-700 to-amber-900"
                                : "from-gray-800 to-gray-900"
                      } opacity-70`}
                    ></div>

                    {/* Card Border Glow Effect when Active */}
                    {currentTurn === "bot" && (
                      <div className="absolute inset-0 border-4 border-red-500 rounded-2xl animate-pulse opacity-70"></div>
                    )}

                    {/* Card Content */}
                    <div className="relative p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold capitalize text-white">{botActivePokemon.name}</h3>
                        <div className="flex">
                          {botActivePokemon.types.map((type, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-1 rounded-full text-white ml-1 ${getTypeBadgeColor(type)}`}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-1/2">
                          <div className="bg-black/30 rounded-xl p-2">
                            <img
                              src={
                                botTeam[activePokemonIndices.bot]?.sprites?.other["official-artwork"]?.front_default ||
                                botTeam[activePokemonIndices.bot]?.sprites?.front_default ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={botActivePokemon.name}
                              className={`w-full h-32 object-contain mx-auto 
                                ${botActivePokemon.isFainted ? "grayscale opacity-50" : ""}`}
                            />
                          </div>
                        </div>

                        <div className="w-1/2 pl-4">
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-white mb-1">
                              <span>HP</span>
                              <span>
                                {botActivePokemon.currentHp}/{botActivePokemon.maxHp}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  botActivePokemon.currentHp / botActivePokemon.maxHp > 0.5
                                    ? "bg-green-500"
                                    : botActivePokemon.currentHp / botActivePokemon.maxHp > 0.2
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${(botActivePokemon.currentHp / botActivePokemon.maxHp) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-white">
                            <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                              <span className="text-red-400 font-semibold">ATK</span>
                              <span>{botActivePokemon.attack}</span>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                              <span className="text-blue-400 font-semibold">DEF</span>
                              <span>{botActivePokemon.defense}</span>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                              <span className="text-green-400 font-semibold">SPD</span>
                              <span>{botActivePokemon.speed}</span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-purple-300 bg-purple-900/50 rounded-lg p-2 truncate">
                            {botActivePokemon.ability.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center/Battlefield Area */}
          <div className="flex flex-col justify-center">
            {/* Battle Effects */}
            {battleEffects.length > 0 && (
              <div className="flex justify-center mb-4">
                {battleEffects.map((effect, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm mx-1 flex items-center gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    {effect.name}
                  </div>
                ))}
              </div>
            )}

            {/* Battle Animation */}
            {showingAttackAnimation && (
              <div className="flex justify-center items-center my-4">
                <div
                  className={`text-4xl animate-bounce ${
                    attackAnimation?.type === "attack"
                      ? "text-red-500"
                      : attackAnimation?.type === "dodge"
                        ? "text-blue-400"
                        : ""
                  }`}
                >
                  {attackAnimation?.type === "attack" ? (
                    <Swords className="h-12 w-12" />
                  ) : attackAnimation?.type === "dodge" ? (
                    <Shield className="h-12 w-12" />
                  ) : null}
                </div>
              </div>
            )}

            {/* Battle Log */}
            <div
              ref={battleLogRef}
              className="bg-gray-900/80 p-3 rounded-xl h-32 overflow-y-auto mb-4 border border-gray-700 shadow-inner"
            >
              {battleLog.map((entry, index) => (
                <div
                  key={index}
                  className={`text-sm mb-1.5 ${
                    entry.type === "player"
                      ? "text-green-400"
                      : entry.type === "bot"
                        ? "text-red-400"
                        : entry.type === "system"
                          ? "text-yellow-400"
                          : entry.type === "ability"
                            ? "text-purple-400"
                            : entry.type === "weather"
                              ? "text-blue-400"
                              : entry.type === "battle"
                                ? "text-orange-400"
                                : "text-gray-400"
                  }`}
                >
                  {entry.message}
                </div>
              ))}
            </div>

            {/* Battle Actions */}
            <div className="flex justify-center">
              {!battleStarted ? (
                <button
                  onClick={startBattle}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-purple-600 text-white text-lg font-bold hover:from-red-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  Start Battle
                </button>
              ) : (
                !battleEnded && (
                  <button
                    onClick={handlePlayerAttack}
                    disabled={currentTurn !== "player" || showingAttackAnimation}
                    className={`px-8 py-3 rounded-xl flex items-center gap-2 text-lg font-bold transition-all ${
                      currentTurn === "player" && !showingAttackAnimation
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 transform hover:scale-105 shadow-lg"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Bolt className="w-5 h-5" />
                    Attack
                  </button>
                )
              )}
            </div>
          </div>

          {/* Player's Side */}
          <div className="flex flex-col items-center">
            {/* Player's Active Pokémon */}
            <div
              className={`relative ${
                showingAttackAnimation && currentTurn === "bot" && attackAnimation?.type === "attack"
                  ? "animate-[shake_0.5s_ease-in-out]"
                  : showingAttackAnimation && currentTurn === "bot" && attackAnimation?.type === "dodge"
                    ? "animate-[bounce_0.5s_ease-in-out]"
                    : ""
              }`}
            >
              {playerActivePokemon && (
                <div className="transform transition-transform duration-300 hover:scale-105">
                  <div
                    className={`relative w-full max-w-xs mx-auto overflow-hidden rounded-2xl ${
                      currentTurn === "player" ? "shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "shadow-lg"
                    }`}
                  >
                    {/* Card background with gradient based on Pokémon type */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${
                        playerActivePokemon.types[0] === "fire"
                          ? "from-red-900 to-orange-900"
                          : playerActivePokemon.types[0] === "water"
                            ? "from-blue-900 to-cyan-900"
                            : playerActivePokemon.types[0] === "grass"
                              ? "from-green-900 to-emerald-900"
                              : playerActivePokemon.types[0] === "electric"
                                ? "from-yellow-700 to-amber-900"
                                : "from-gray-800 to-gray-900"
                      } opacity-70`}
                    ></div>

                    {/* Card Border Glow Effect when Active */}
                    {currentTurn === "player" && (
                      <div className="absolute inset-0 border-4 border-green-500 rounded-2xl animate-pulse opacity-70"></div>
                    )}

                    {/* Card Content */}
                    <div className="relative p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold capitalize text-white">{playerActivePokemon.name}</h3>
                        <div className="flex">
                          {playerActivePokemon.types.map((type, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-1 rounded-full text-white ml-1 ${getTypeBadgeColor(type)}`}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-1/2">
                          <div className="bg-black/30 rounded-xl p-2">
                            <img
                              src={
                                playerTeam[activePokemonIndices.player]?.sprites?.other["official-artwork"]
                                  ?.front_default ||
                                playerTeam[activePokemonIndices.player]?.sprites?.front_default ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={playerActivePokemon.name}
                              className={`w-full h-32 object-contain mx-auto 
                                ${playerActivePokemon.isFainted ? "grayscale opacity-50" : ""}`}
                            />
                          </div>
                        </div>

                        <div className="w-1/2 pl-4">
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-white mb-1">
                              <span>HP</span>
                              <span>
                                {playerActivePokemon.currentHp}/{playerActivePokemon.maxHp}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  playerActivePokemon.currentHp / playerActivePokemon.maxHp > 0.5
                                    ? "bg-green-500"
                                    : playerActivePokemon.currentHp / playerActivePokemon.maxHp > 0.2
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${(playerActivePokemon.currentHp / playerActivePokemon.maxHp) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-white">
                            <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                              <span className="text-red-400 font-semibold">ATK</span>
                              <span>{playerActivePokemon.attack}</span>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                              <span className="text-blue-400 font-semibold">DEF</span>
                              <span>{playerActivePokemon.defense}</span>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                              <span className="text-green-400 font-semibold">SPD</span>
                              <span>{playerActivePokemon.speed}</span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-purple-300 bg-purple-900/50 rounded-lg p-2 truncate">
                            {playerActivePokemon.ability.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Player's Bench */}
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {pokemonStats.player.map((pokemon, index) => (
                <div
                  key={`player-bench-${pokemon.id}`}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center 
                    ${pokemon.isFainted ? "bg-gray-800/50 opacity-50 grayscale" : "bg-gray-800/80"}
                    ${
                      index === activePokemonIndices.player
                        ? "ring-2 ring-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                        : "ring-1 ring-gray-700"
                    }`}
                >
                  <img
                    src={playerTeam[index]?.sprites?.front_default || "/placeholder.svg" || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="w-10 h-10"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BattleSystem
