"use client"

import { useState, useEffect } from "react"
import { fetchPokemonDetails } from "../../services/pokemonService"
import TypeBadge from "../ui/TypeBadge"
import { extractIdFromUrl } from "../../utils/helpers"

function PokemonCard({
  pokemon,
  onClick,
  actionSlot,
  isTeamCard = false,
  isActive = false,
  isFainted = false,
  isDamaged = false,
  currentHp = null,
  maxHp = null,
}) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const pokemonId = pokemon.id || extractIdFromUrl(pokemon.url)

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true)
        const pokemonDetails = await fetchPokemonDetails(pokemonId)
        setDetails(pokemonDetails)
      } catch (err) {
        setError("Failed to load details")
        console.error(`Error loading details for ${pokemon.name}:`, err)
      } finally {
        setLoading(false)
      }
    }

    loadDetails()
  }, [pokemonId, pokemon.name])

  // Card class based on state and props
  const cardClass = `
    ${isTeamCard ? "pokemon-card-battle" : "pokemon-card"}
    ${isActive ? "active" : ""}
    ${isFainted ? "fainted" : ""}
    ${isDamaged ? "damaged" : ""}
    ${isTeamCard ? (isActive ? "border-yellow-400" : "border-transparent") : ""}
  `

  // Calculate HP percentage if in battle mode
  const hpPercentage = currentHp !== null && maxHp !== null ? Math.max(0, (currentHp / maxHp) * 100) : 100

  if (loading) {
    return (
      <div className={`pokemon-card animate-pulse p-4`}>
        <div className="w-full h-32 bg-gray-700 rounded-md"></div>
        <div className="mt-2 w-3/4 h-4 bg-gray-700 rounded"></div>
        <div className="mt-2 w-1/2 h-3 bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="pokemon-card p-4 bg-red-900/20">
        <p className="text-sm text-red-400">Error loading {pokemon.name}</p>
      </div>
    )
  }

  return (
    <div className={cardClass} onClick={() => onClick && onClick(pokemonId)}>
      {actionSlot}

      <div className="w-full p-4">
        <img
          src={details.sprites.other["official-artwork"].front_default || details.sprites.front_default}
          alt={details.name}
          className="w-full h-32 object-contain mx-auto"
        />

        <h3 className="text-lg font-semibold capitalize mt-2">{details.name}</h3>

        <p className="text-gray-400 text-sm">#{details.id.toString().padStart(3, "0")}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {details.types.map((type) => (
            <TypeBadge key={type.type.name} type={type.type.name} />
          ))}
        </div>

        {isTeamCard && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>HP</span>
              <span>{currentHp !== null ? `${currentHp}/${maxHp}` : `${details.stats[0].base_stat}`}</span>
            </div>
            <div className="health-bar">
              <div className="health-bar-fill" style={{ width: `${hpPercentage}%` }}></div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
              <div>
                <span className="text-red-400">ATK:</span> {details.stats[1].base_stat}
              </div>
              <div>
                <span className="text-blue-400">DEF:</span> {details.stats[2].base_stat}
              </div>
              <div>
                <span className="text-yellow-400">SPD:</span> {details.stats[5].base_stat}
              </div>
              <div>
                <span className="text-purple-400">SP:</span> {details.stats[3].base_stat}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PokemonCard
