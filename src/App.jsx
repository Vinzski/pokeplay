"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import Pokedex from "./components/pokedex/Pokedex"
import PokemonDetails from "./components/pokedex/PokemonDetails"
import TeamBuilder from "./components/team/TeamBuilder"
import BattleSystem from "./components/battle/BattleSystem"
import BattleHistory from "./components/battle/BattleHistory"
import PlayerProfile from "./components/profile/PlayerProfile"
import FavoritesPage from "./components/favorites/FavoritesPage"
import { fetchPlayerProfile, createDefaultProfile } from "./services/playerService"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function App() {
  const [playerProfile, setPlayerProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Try to fetch the player profile from the JSON server
        const profile = await fetchPlayerProfile()
        if (profile) {
          setPlayerProfile(profile)
        } else {
          // If no profile exists, create a default one
          const newProfile = await createDefaultProfile()
          setPlayerProfile(newProfile)
        }
      } catch (error) {
        console.error("Failed to initialize player profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
        <Navbar playerProfile={playerProfile} />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Pokedex />} />
            <Route path="/pokemon/:id" element={<PokemonDetails />} />
            <Route
              path="/team"
              element={<TeamBuilder playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} />}
            />
            <Route
              path="/battle"
              element={<BattleSystem playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} />}
            />
            <Route path="/history" element={<BattleHistory />} />
            <Route
              path="/profile"
              element={<PlayerProfile playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} />}
            />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </Router>
  )
}

export default App
