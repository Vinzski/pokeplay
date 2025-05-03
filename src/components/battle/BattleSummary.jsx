"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { TrophyIcon, HomeIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

function BattleSummary({ summary, onNewBattle }) {
  const [expandedTeam, setExpandedTeam] = useState(null)
  const navigate = useNavigate()

  const handleViewHistory = () => {
    navigate("/history")
  }

  const handleHome = () => {
    navigate("/")
  }

  const toggleTeamExpand = (team) => {
    if (expandedTeam === team) {
      setExpandedTeam(null)
    } else {
      setExpandedTeam(team)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy h:mm a")
  }

  // Calculate stats
  const playerFainted = summary.playerTeam.filter((p) => p.remaining_hp === 0).length
  const botFainted = summary.botTeam.filter((p) => p.remaining_hp === 0).length

  const getTeamHealthPercentage = (team) => {
    const totalCurrentHp = team.reduce((sum, pokemon) => sum + pokemon.remaining_hp, 0)
    const totalMaxHp = team.reduce((sum, pokemon) => sum + pokemon.max_hp, 0)
    return Math.round((totalCurrentHp / totalMaxHp) * 100)
  }

  const playerTeamHealth = getTeamHealthPercentage(summary.playerTeam)
  const botTeamHealth = getTeamHealthPercentage(summary.botTeam)

  return (
    <div className="container mx-auto">
      <div className="card p-6 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Battle Results</h1>
          <p className="text-gray-400">{formatDate(summary.date)}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="bg-gray-900 rounded-full p-4 mb-4">
              <TrophyIcon className={`w-12 h-12 ${summary.winner === "player" ? "text-yellow-400" : "text-red-500"}`} />
            </div>
            <h2 className="text-2xl font-bold mb-1">{summary.winner === "player" ? "Victory!" : "Defeat!"}</h2>
            <p className="text-gray-400 mb-4">
              {summary.winner === "player" ? "You won the battle!" : "The bot won this time!"}
            </p>
            <div className="bg-gray-700 rounded-lg p-4 w-full max-w-sm">
              <div className="flex justify-between mb-1 text-sm">
                <span>
                  Difficulty: <span className="font-bold">{summary.difficulty.toUpperCase()}</span>
                </span>
                <span>
                  Mode: <span className="font-bold">{summary.mode === "vsBot" ? "VS Bot" : "Simulation"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
              <span>Your Team</span>
              <button onClick={() => toggleTeamExpand("player")} className="text-sm text-gray-400 hover:text-white">
                {expandedTeam === "player" ? "Collapse" : "Expand"}
              </button>
            </h3>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Team Health</span>
                <span>{playerTeamHealth}%</span>
              </div>
              <div className="health-bar">
                <div className="health-bar-fill" style={{ width: `${playerTeamHealth}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-2 mb-2">
              <div className="flex justify-between">
                <span>Pokémon fainted</span>
                <span>
                  {playerFainted} / {summary.playerTeam.length}
                </span>
              </div>
            </div>

            {expandedTeam === "player" && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {summary.playerTeam.map((pokemon, index) => (
                  <div key={`player-${index}`} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium capitalize">{pokemon.name}</span>
                      <span className="text-sm">
                        {pokemon.remaining_hp} / {pokemon.max_hp}
                      </span>
                    </div>
                    <div className="health-bar">
                      <div
                        className="health-bar-fill"
                        style={{ width: `${(pokemon.remaining_hp / pokemon.max_hp) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
              <span>Bot Team</span>
              <button onClick={() => toggleTeamExpand("bot")} className="text-sm text-gray-400 hover:text-white">
                {expandedTeam === "bot" ? "Collapse" : "Expand"}
              </button>
            </h3>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Team Health</span>
                <span>{botTeamHealth}%</span>
              </div>
              <div className="health-bar">
                <div className="health-bar-fill" style={{ width: `${botTeamHealth}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-2 mb-2">
              <div className="flex justify-between">
                <span>Pokémon fainted</span>
                <span>
                  {botFainted} / {summary.botTeam.length}
                </span>
              </div>
            </div>

            {expandedTeam === "bot" && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {summary.botTeam.map((pokemon, index) => (
                  <div key={`bot-${index}`} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium capitalize">{pokemon.name}</span>
                      <span className="text-sm">
                        {pokemon.remaining_hp} / {pokemon.max_hp}
                      </span>
                    </div>
                    <div className="health-bar">
                      <div
                        className="health-bar-fill"
                        style={{ width: `${(pokemon.remaining_hp / pokemon.max_hp) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={onNewBattle} className="btn btn-primary flex items-center justify-center">
            <ArrowPathIcon className="w-5 h-5 mr-1" />
            New Battle
          </button>
          <button onClick={handleViewHistory} className="btn btn-secondary flex items-center justify-center">
            View Battle History
          </button>
          <button onClick={handleHome} className="btn btn-outline flex items-center justify-center">
            <HomeIcon className="w-5 h-5 mr-1" />
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default BattleSummary
