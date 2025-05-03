"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PokemonCard from "../pokedex/PokemonCard"
import { HeartIcon, TrashIcon } from "@heroicons/react/24/outline"
import { toast } from "react-toastify"

function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Load favorites from localStorage
    const loadFavorites = () => {
      try {
        setLoading(true)
        const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        setFavorites(storedFavorites)
      } catch (error) {
        console.error("Error loading favorites:", error)
        toast.error("Failed to load favorites")
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const handlePokemonClick = (id) => {
    navigate(`/pokemon/${id}`)
  }

  const handleRemoveFavorite = (id, e) => {
    e.stopPropagation()
    try {
      const updatedFavorites = favorites.filter((pokemon) => pokemon.id !== id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      setFavorites(updatedFavorites)
      toast.success("Removed from favorites")
    } catch (error) {
      console.error("Error removing from favorites:", error)
      toast.error("Failed to remove from favorites")
    }
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all favorites?")) {
      localStorage.setItem("favorites", JSON.stringify([]))
      setFavorites([])
      toast.success("All favorites cleared")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Loading favorites...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Your Favorite Pokémon</h1>
        <p className="text-gray-400">Manage your collection of favorite Pokémon</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center my-16 bg-gray-800 rounded-xl p-8">
          <HeartIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Favorites Yet</h3>
          <p className="text-gray-400 mb-4">Add Pokémon to your favorites from the Pokédex</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Browse Pokédex
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearAll}
              className="btn btn-outline text-red-500 border-red-500 hover:bg-red-500/20"
            >
              Clear All Favorites
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 my-8">
            {favorites.map((pokemon) => (
              <div key={pokemon.id} className="relative">
                <PokemonCard
                  pokemon={pokemon}
                  onClick={() => handlePokemonClick(pokemon.id)}
                  actionSlot={
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white"
                      onClick={(e) => handleRemoveFavorite(pokemon.id, e)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default FavoritesPage
