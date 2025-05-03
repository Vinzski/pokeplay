"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUserTeam, savePokemonTeam, removePokemonFromTeam } from "../../services/teamService"
import PokemonCard from "../pokedex/PokemonCard"
import { toast } from "react-toastify"
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline"

function TeamBuilder({ playerProfile, setPlayerProfile }) {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true)
        const userTeam = await getUserTeam()
        setTeam(userTeam)
      } catch (error) {
        console.error("Error loading team:", error)
        toast.error("Failed to load your team")
      } finally {
        setLoading(false)
      }
    }

    loadTeam()
  }, [])

  const handleAddPokemon = () => {
    navigate("/")
  }

  const handlePokemonClick = (id) => {
    navigate(`/pokemon/${id}`)
  }

  const handleRemovePokemon = async (pokemonId) => {
    if (confirmDelete === pokemonId) {
      try {
        const result = await removePokemonFromTeam(pokemonId)
        if (result.success) {
          setTeam(team.filter((pokemon) => pokemon.id !== pokemonId))
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error("Error removing Pokémon:", error)
        toast.error("Failed to remove Pokémon from team")
      }
      setConfirmDelete(null)
    } else {
      setConfirmDelete(pokemonId)
    }
  }

  const handleClearTeam = async () => {
    if (window.confirm("Are you sure you want to clear your entire team?")) {
      try {
        await savePokemonTeam([])
        setTeam([])
        toast.success("Team cleared successfully")
      } catch (error) {
        console.error("Error clearing team:", error)
        toast.error("Failed to clear your team")
      }
    }
  }

  const renderEmptySlots = () => {
    const emptySlots = []
    for (let i = 0; i < 6 - team.length; i++) {
      emptySlots.push(
        <div
          key={`empty-${i}`}
          className="pokemon-card border-2 border-dashed border-gray-700 flex items-center justify-center h-64"
        >
          <div className="text-center text-gray-500">
            <PlusIcon className="w-10 h-10 mx-auto" />
            <p>Empty Slot</p>
          </div>
        </div>,
      )
    }
    return emptySlots
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Team Builder</h1>
        <p className="text-gray-400">Build your perfect Pokémon team (max 6)</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xl">Loading your team...</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Team ({team.length}/6)</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleAddPokemon}
                disabled={team.length >= 6}
                className="btn btn-primary flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add Pokémon
              </button>
              {team.length > 0 && (
                <button
                  onClick={handleClearTeam}
                  className="btn btn-outline text-red-500 border-red-500 hover:bg-red-500/20 flex items-center"
                >
                  <TrashIcon className="w-5 h-5 mr-1" />
                  Clear Team
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">
            {team.map((pokemon) => (
              <div key={pokemon.id} className="relative">
                <PokemonCard pokemon={pokemon} onClick={handlePokemonClick} isTeamCard={true} />
                <button
                  className={`absolute top-2 right-2 p-1.5 rounded-full ${
                    confirmDelete === pokemon.id ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => handleRemovePokemon(pokemon.id)}
                >
                  {confirmDelete === pokemon.id ? (
                    <XMarkIcon className="h-5 w-5 text-white" />
                  ) : (
                    <TrashIcon className="h-5 w-5 text-gray-300" />
                  )}
                </button>
              </div>
            ))}
            {renderEmptySlots()}
          </div>

          {team.length === 0 && (
            <div className="text-center my-16 bg-gray-800 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-2">Your team is empty!</h3>
              <p className="text-gray-400 mb-4">Add some Pokémon to build your team</p>
              <button onClick={handleAddPokemon} className="btn btn-primary">
                Browse Pokémon
              </button>
            </div>
          )}

          {team.length > 0 && (
            <div className="flex justify-center mt-8">
              <button onClick={() => navigate("/battle")} className="btn btn-primary px-8 py-3 text-lg">
                Battle With This Team
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeamBuilder
