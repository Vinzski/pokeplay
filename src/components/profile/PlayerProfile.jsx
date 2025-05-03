"use client"

import { useState, useEffect } from "react"
import { updatePlayerProfile } from "../../services/playerService"
import { getBattleHistory } from "../../services/battleService"
import { toast } from "react-toastify"
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"

function PlayerProfile({ playerProfile, setPlayerProfile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    avatarColor: "#FF0000",
  })
  const [battlesStats, setBattlesStats] = useState({
    total: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (playerProfile) {
      setFormData({
        username: playerProfile.username || "",
        avatarColor: playerProfile.avatarColor || "#FF0000",
      })
    }
  }, [playerProfile])

  useEffect(() => {
    const loadBattleStats = async () => {
      try {
        setLoading(true)
        const history = await getBattleHistory()

        const wins = history.filter((battle) => battle.winner === "player").length
        const total = history.length
        const losses = total - wins
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

        setBattlesStats({
          total,
          wins,
          losses,
          winRate,
        })
      } catch (error) {
        console.error("Error loading battle stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBattleStats()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username.trim()) {
      toast.error("Username cannot be empty")
      return
    }

    try {
      const updatedProfile = await updatePlayerProfile({
        ...playerProfile,
        username: formData.username,
        avatarColor: formData.avatarColor,
      })

      setPlayerProfile(updatedProfile)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const handleCancelEdit = () => {
    setFormData({
      username: playerProfile?.username || "",
      avatarColor: playerProfile?.avatarColor || "#FF0000",
    })
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Trainer Profile</h1>
        <p className="text-gray-400">View and edit your trainer information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trainer Info</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-outline flex items-center">
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button onClick={handleSubmit} className="btn btn-primary flex items-center">
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Save
                </button>
                <button onClick={handleCancelEdit} className="btn btn-outline flex items-center">
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mb-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-3"
              style={{ backgroundColor: formData.avatarColor }}
            >
              {formData.username ? (
                formData.username.charAt(0).toUpperCase()
              ) : (
                <UserIcon className="w-12 h-12 text-white" />
              )}
            </div>

            {isEditing ? (
              <form className="w-full">
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Enter your trainer name"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Avatar Color</label>
                  <input
                    type="color"
                    name="avatarColor"
                    value={formData.avatarColor}
                    onChange={handleChange}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
              </form>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-bold">{playerProfile?.username || "Trainer"}</h3>
                <p className="text-gray-400 mt-1">Pokémon Trainer</p>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">Account Info</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Trainer ID:</span>
                <span>#{playerProfile?.id || "000001"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span>
                  {playerProfile?.createdAt ? new Date(playerProfile.createdAt).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Stats */}
        <div className="md:col-span-2">
          <div className="card p-6 h-full">
            <h2 className="text-2xl font-bold mb-4">Battle Statistics</h2>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Total Battles</p>
                    <p className="text-3xl font-bold">{battlesStats.total}</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Wins</p>
                    <p className="text-3xl font-bold text-green-500">{battlesStats.wins}</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Losses</p>
                    <p className="text-3xl font-bold text-red-500">{battlesStats.losses}</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Win Rate</p>
                    <p className="text-3xl font-bold text-blue-500">{battlesStats.winRate}%</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h3 className="font-bold mb-2">Win Rate</h3>
                  <div className="h-4 bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${battlesStats.winRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Difficulty Breakdown</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Easy</span>
                        <span>
                          {playerProfile?.easyWins || 0} / {playerProfile?.easyTotal || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${
                              playerProfile?.easyTotal ? (playerProfile.easyWins / playerProfile.easyTotal) * 100 : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Medium</span>
                        <span>
                          {playerProfile?.mediumWins || 0} / {playerProfile?.mediumTotal || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              playerProfile?.mediumTotal
                                ? (playerProfile.mediumWins / playerProfile.mediumTotal) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hard</span>
                        <span>
                          {playerProfile?.hardWins || 0} / {playerProfile?.hardTotal || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${
                              playerProfile?.hardTotal ? (playerProfile.hardWins / playerProfile.hardTotal) * 100 : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Insane</span>
                        <span>
                          {playerProfile?.insaneWins || 0} / {playerProfile?.insaneTotal || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${
                              playerProfile?.insaneTotal
                                ? (playerProfile.insaneWins / playerProfile.insaneTotal) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerProfile
