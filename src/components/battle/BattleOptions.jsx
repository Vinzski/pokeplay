"use client"

import { useState } from "react"
import { ShieldCheckIcon, BoltIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

function BattleOptions({ onSelectMode }) {
  const [selectedMode, setSelectedMode] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")

  const handleModeSelect = (mode) => {
    setSelectedMode(mode)
  }

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty)
  }

  const handleStartBattle = () => {
    if (selectedMode) {
      // For simulation mode, we don't need difficulty
      if (selectedMode === "simulation") {
        onSelectMode(selectedMode, null)
      } else {
        onSelectMode(selectedMode, selectedDifficulty)
      }
    }
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Battle System</h1>
        <p className="text-gray-400">Select your battle mode and difficulty</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          className={`card p-6 cursor-pointer transition-all hover:transform hover:scale-105 ${selectedMode === "vsBot" ? "ring-2 ring-red-500" : ""}`}
          onClick={() => handleModeSelect("vsBot")}
        >
          <div className="flex items-center mb-4">
            <BoltIcon className="w-8 h-8 text-red-500 mr-2" />
            <h2 className="text-2xl font-bold">VS Bot</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Battle against the computer! The bot will automatically select a team based on the difficulty level and make
            decisions during battle.
          </p>
          <ul className="list-disc list-inside text-gray-300">
            <li>Computer selects and controls a team</li>
            <li>Turns are automatic for the bot</li>
            <li>Multiple difficulty levels</li>
          </ul>
        </div>

        <div
          className={`card p-6 cursor-pointer transition-all hover:transform hover:scale-105 ${selectedMode === "simulation" ? "ring-2 ring-blue-500" : ""}`}
          onClick={() => handleModeSelect("simulation")}
        >
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-blue-500 mr-2" />
            <h2 className="text-2xl font-bold">Simulation</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Choose both teams and control both sides of the battle to practice strategies or see how different Pokémon
            match up against each other.
          </p>
          <ul className="list-disc list-inside text-gray-300">
            <li>You select both teams</li>
            <li>Perfect for practice and learning</li>
            <li>Test strategies before real battles</li>
          </ul>
        </div>
      </div>

      {selectedMode === "vsBot" && (
        <div className="card p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Select Difficulty</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedDifficulty === "easy" ? "bg-green-600 text-white" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => handleDifficultySelect("easy")}
            >
              Easy
            </button>
            <button
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedDifficulty === "medium" ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => handleDifficultySelect("medium")}
            >
              Medium
            </button>
            <button
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedDifficulty === "hard" ? "bg-red-600 text-white" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => handleDifficultySelect("hard")}
            >
              Hard
            </button>
            <button
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedDifficulty === "insane" ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => handleDifficultySelect("insane")}
            >
              Insane
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleStartBattle}
          disabled={!selectedMode}
          className={`btn btn-primary flex items-center text-lg px-8 py-3 ${!selectedMode ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Start Battle
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  )
}

export default BattleOptions
