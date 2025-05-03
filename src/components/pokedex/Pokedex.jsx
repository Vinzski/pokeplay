"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchPokemonList, fetchPokemonDetails } from "../../services/pokemonService"
import PokemonCard from "./PokemonCard"
import SearchBar from "../ui/SearchBar"
import Pagination from "../ui/Pagination"
import { PlusIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline"
import { toast } from "react-toastify"

// Pokemon types for filtering
const POKEMON_TYPES = [
  "all",
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
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

function Pokedex() {
  const [pokemon, setPokemon] = useState([])
  const [allPokemon, setAllPokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedType, setSelectedType] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("id") // "id", "name", "hp", "attack", "defense"
  const [sortOrder, setSortOrder] = useState("asc") // "asc" or "desc"
  const [favorites, setFavorites] = useState([])
  const limit = 20
  const navigate = useNavigate()

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setFavorites(storedFavorites.map((fav) => fav.id))
  }, [])

  // Initial load of Pokémon
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true)
        // Fetch a larger batch for filtering
        const { results, count } = await fetchPokemonList(500, 0)

        // Fetch details for all Pokémon
        const detailedPokemon = await Promise.all(
          results.map(async (p) => {
            try {
              return await fetchPokemonDetails(p.id || p.url.split("/")[6])
            } catch (error) {
              console.error(`Error fetching details for ${p.name}:`, error)
              return null
            }
          }),
        )

        // Filter out any null results
        const validPokemon = detailedPokemon.filter((p) => p !== null)
        setAllPokemon(validPokemon)

        // Apply filters and sorting
        applyFiltersAndSort(validPokemon)
      } catch (err) {
        setError("Failed to load Pokémon. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPokemon()
  }, [])

  // Apply filters and sorting whenever filter criteria change
  useEffect(() => {
    if (allPokemon.length > 0) {
      applyFiltersAndSort(allPokemon)
    }
  }, [searchTerm, selectedType, sortBy, sortOrder, currentPage])

  const applyFiltersAndSort = (pokemonList) => {
    let filtered = [...pokemonList]

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((p) => p.types.some((t) => t.type.name === selectedType))
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term) || p.id.toString().includes(term))
    }

    // Sort the results
    filtered = sortPokemon(filtered, sortBy, sortOrder)

    // Calculate total pages
    const total = Math.ceil(filtered.length / limit)
    setTotalPages(total)

    // Paginate
    const start = (currentPage - 1) * limit
    const paginatedResults = filtered.slice(start, start + limit)

    setPokemon(paginatedResults)
  }

  const sortPokemon = (pokemonList, sortBy, sortOrder) => {
    return [...pokemonList].sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case "hp":
          valueA = a.stats[0].base_stat
          valueB = b.stats[0].base_stat
          break
        case "attack":
          valueA = a.stats[1].base_stat
          valueB = b.stats[1].base_stat
          break
        case "defense":
          valueA = a.stats[2].base_stat
          valueB = b.stats[2].base_stat
          break
        default: // id
          valueA = a.id
          valueB = b.id
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleTypeFilter = (type) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePokemonClick = (id) => {
    navigate(`/pokemon/${id}`)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const toggleFavorite = (pokemon, e) => {
    e.stopPropagation()

    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]")

    if (favorites.includes(pokemon.id)) {
      // Remove from favorites
      const updatedFavorites = storedFavorites.filter((fav) => fav.id !== pokemon.id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      setFavorites(favorites.filter((id) => id !== pokemon.id))
      toast.info(`${pokemon.name} removed from favorites`)
    } else {
      // Add to favorites
      const pokemonToSave = {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
        types: pokemon.types.map((t) => t.type.name),
        url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`,
      }
      localStorage.setItem("favorites", JSON.stringify([...storedFavorites, pokemonToSave]))
      setFavorites([...favorites, pokemon.id])
      toast.success(`${pokemon.name} added to favorites`)
    }
  }

  if (loading && pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Loading Pokémon...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-500/20 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-lg">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Pokédex</h1>
        <p className="text-gray-400">Browse and discover all Pokémon</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-grow">
          <SearchBar placeholder="Search Pokémon by name or ID..." value={searchTerm} onChange={handleSearch} />
        </div>
        <button onClick={toggleFilters} className="btn btn-outline flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Filter by Type</h3>
              <div className="flex flex-wrap gap-2">
                {POKEMON_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    className={`px-3 py-1 rounded-full text-sm capitalize ${
                      selectedType === type
                        ? type === "all"
                          ? "bg-gray-600 text-white"
                          : `type-${type} text-white`
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Sort Options</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sort By</label>
                  <select value={sortBy} onChange={handleSortChange} className="input w-full">
                    <option value="id">ID Number</option>
                    <option value="name">Name</option>
                    <option value="hp">HP</option>
                    <option value="attack">Attack</option>
                    <option value="defense">Defense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Order</label>
                  <select value={sortOrder} onChange={handleSortOrderChange} className="input w-full">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && pokemon.length > 0 ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : pokemon.length === 0 ? (
        <div className="text-center my-16">
          <h3 className="text-2xl font-semibold">No Pokémon Found</h3>
          <p className="text-gray-400 mt-2">Try a different search term or filter</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 my-8">
            {pokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.name}
                pokemon={pokemon}
                onClick={handlePokemonClick}
                actionSlot={
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      className={`p-1 ${favorites.includes(pokemon.id) ? "bg-red-500" : "bg-gray-700"} hover:bg-red-600 rounded-full text-white`}
                      onClick={(e) => toggleFavorite(pokemon, e)}
                      title={favorites.includes(pokemon.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      className="p-1 bg-blue-500 hover:bg-blue-600 rounded-full text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/pokemon/${pokemon.id}`, { state: { addToTeam: true } })
                      }}
                      title="Add to team"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                }
              />
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

export default Pokedex
