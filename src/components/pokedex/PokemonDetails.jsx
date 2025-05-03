"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { fetchPokemonDetails } from "../../services/pokemonService"
import { addPokemonToTeam } from "../../services/teamService"
import { toast } from "react-toastify"
import TypeBadge from "../ui/TypeBadge"
import { HeartIcon, PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"

function PokemonDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const loadPokemonDetails = async () => {
      try {
        setLoading(true)
        const details = await fetchPokemonDetails(id)
        setPokemon(details)

        // Check if this Pokémon is in favorites
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        setIsFavorite(favorites.some((fav) => fav.id === details.id))
      } catch (err) {
        setError("Failed to load Pokémon details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPokemonDetails()
  }, [id])

  useEffect(() => {
    // Check if we should automatically open "Add to Team" dialog
    if (location.state?.addToTeam && pokemon) {
      handleAddToTeam()
    }
  }, [pokemon, location.state])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleAddToTeam = async () => {
    try {
      const result = await addPokemonToTeam(pokemon)
      if (result.success) {
        toast.success(result.message)
        // Redirect to team page after short delay
        setTimeout(() => navigate("/team"), 1500)
      } else {
        toast.warning(result.message)
      }
    } catch (error) {
      toast.error("Failed to add Pokémon to team")
      console.error(error)
    }
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")

    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav) => fav.id !== pokemon.id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      toast.info(`${pokemon.name} removed from favorites`)
    } else {
      const pokemonToSave = {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
        types: pokemon.types.map((t) => t.type.name),
        url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`,
      }
      localStorage.setItem("favorites", JSON.stringify([...favorites, pokemonToSave]))
      toast.success(`${pokemon.name} added to favorites`)
    }

    setIsFavorite(!isFavorite)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Loading Pokémon details...</p>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-500/20 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-lg">{error || "Failed to load Pokémon details"}</p>
          <button onClick={handleGoBack} className="mt-4 btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Calculate stat percentage for visual bars (max stat value is 255)
  const calculateStatPercentage = (value) => {
    return Math.min(100, (value / 255) * 100)
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4">
        <button onClick={handleGoBack} className="flex items-center text-gray-400 hover:text-white">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pokémon Image and Basic Info */}
        <div className="card p-6 flex flex-col items-center">
          <img
            src={pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-64 h-64 object-contain mx-auto"
          />

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center">
              <h1 className="text-3xl font-bold capitalize">{pokemon.name}</h1>
              <button onClick={toggleFavorite} className="ml-2 p-1 rounded-full hover:bg-gray-700">
                {isFavorite ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-500" />
                )}
              </button>
            </div>

            <p className="text-gray-400 mt-1">#{pokemon.id.toString().padStart(3, "0")}</p>

            <div className="flex justify-center gap-2 mt-3">
              {pokemon.types.map((type) => (
                <TypeBadge key={type.type.name} type={type.type.name} size="large" />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Height</p>
                <p className="text-xl font-semibold">{pokemon.height / 10} m</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Weight</p>
                <p className="text-xl font-semibold">{pokemon.weight / 10} kg</p>
              </div>
            </div>

            <button onClick={handleAddToTeam} className="mt-6 btn btn-primary flex items-center justify-center w-full">
              <PlusIcon className="w-5 h-5 mr-1" />
              Add to Team
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Base Stats</h2>

          <div className="space-y-4">
            {pokemon.stats.map((stat) => {
              const statName = stat.stat.name
                .replace("special-attack", "Sp. Atk")
                .replace("special-defense", "Sp. Def")
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")

              const statClass = `stat-${stat.stat.name.replace("special-", "special-")}`
              const statColor = getStatColor(stat.base_stat)

              return (
                <div key={stat.stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{statName}</span>
                    <span className="text-sm font-medium">{stat.base_stat}</span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className={`stat-bar-fill ${statColor}`}
                      style={{ width: `${calculateStatPercentage(stat.base_stat)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Abilities and Moves */}
        <div className="flex flex-col gap-6">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Abilities</h2>
            <div className="space-y-2">
              {pokemon.abilities.map((ability) => (
                <div
                  key={ability.ability.name}
                  className={`p-3 rounded-lg bg-gray-700 ${ability.is_hidden ? "border border-yellow-500" : ""}`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{ability.ability.name.replace("-", " ")}</span>
                    {ability.is_hidden && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">Hidden</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Moves</h2>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {pokemon.moves.slice(0, 10).map((move) => (
                <div key={move.move.name} className="p-2 bg-gray-700 rounded">
                  <span className="capitalize">{move.move.name.replace("-", " ")}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">Showing 10 out of {pokemon.moves.length} moves</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get color based on stat value
function getStatColor(value) {
  if (value < 50) return "bg-red-500"
  if (value < 80) return "bg-orange-500"
  if (value < 110) return "bg-yellow-500"
  if (value < 140) return "bg-green-500"
  return "bg-blue-500"
}

export default PokemonDetails
