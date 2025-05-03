"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getBattleHistory } from "../../services/battleService"
import { format } from "date-fns"
import { TrophyIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"

function BattleHistory() {
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOrder, setSortOrder] = useState("newest")
  const [filter, setFilter] = useState("all")
  const navigate = useNavigate()

  useEffect(() => {
    const loadBattleHistory = async () => {
      try {
        setLoading(true)
        const history = await getBattleHistory()
        setBattles(history)
      } catch (err) {
        setError("Failed to load battle history. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadBattleHistory()
  }, [])

  const handleGoBack = () => {
    navigate(-1)
  }

  const getSortedBattles = () => {
    let filteredBattles = [...battles]

    // Apply filter
    if (filter === "wins") {
      filteredBattles = filteredBattles.filter((battle) => battle.winner === "player")
    } else if (filter === "losses") {
      filteredBattles = filteredBattles.filter((battle) => battle.winner === "bot")
    }

    // Apply sort
    return filteredBattles.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })
  }

  const formattedDate = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Loading battle history...</p>
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

  const sortedBattles = getSortedBattles()

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <button onClick={handleGoBack} className="flex items-center text-gray-400 hover:text-white">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back
        </button>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Battle History</h1>
        <p className="text-gray-400">View your past battles and results</p>
      </div>

      {battles.length === 0 ? (
        <div className="text-center my-16 bg-gray-800 rounded-xl p-8">
          <h3 className="text-2xl font-semibold mb-2">No Battles Found</h3>
          <p className="text-gray-400 mb-4">You haven't fought any battles yet</p>
          <button onClick={() => navigate("/battle")} className="btn btn-primary">
            Start a Battle
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-3">
            <div className="flex gap-2">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input">
                <option value="all">All Battles</option>
                <option value="wins">Wins Only</option>
                <option value="losses">Losses Only</option>
              </select>

              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 text-center md:text-right">
              <div className="text-sm">
                <span className="text-gray-400">Total Battles:</span> {battles.length}
              </div>
              <div className="text-sm">
                <span className="text-green-400">Wins:</span> {battles.filter((b) => b.winner === "player").length} |
                <span className="text-red-400 ml-1">Losses:</span> {battles.filter((b) => b.winner === "bot").length}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sortedBattles.map((battle, index) => (
              <div key={index} className="card p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TrophyIcon
                        className={`w-5 h-5 ${battle.winner === "player" ? "text-yellow-400" : "text-red-500"}`}
                      />
                      <h3 className="text-xl font-bold">{battle.winner === "player" ? "Victory" : "Defeat"}</h3>
                    </div>

                    <p className="text-gray-400 text-sm mb-2">{formattedDate(battle.date)}</p>

                    <div className="grid grid-cols-2 gap-2 bg-gray-800 p-2 rounded-lg text-sm">
                      <div>
                        <span className="text-gray-400">Difficulty:</span> {battle.difficulty.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-gray-400">Mode:</span> {battle.mode === "vsBot" ? "VS Bot" : "Simulation"}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Your Team</h4>
                        <div className="bg-gray-800 p-2 rounded-lg">
                          <p className="text-sm">
                            <span className="text-gray-400">Pokémon:</span> {battle.playerTeam.length}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-400">Fainted:</span>{" "}
                            {battle.playerTeam.filter((p) => p.remaining_hp === 0).length}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-1">Bot Team</h4>
                        <div className="bg-gray-800 p-2 rounded-lg">
                          <p className="text-sm">
                            <span className="text-gray-400">Pokémon:</span> {battle.botTeam.length}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-400">Fainted:</span>{" "}
                            {battle.botTeam.filter((p) => p.remaining_hp === 0).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default BattleHistory
