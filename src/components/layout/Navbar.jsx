"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Bars3Icon, XMarkIcon, HeartIcon } from "@heroicons/react/24/outline"

function Navbar({ playerProfile }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-red-500">
                <span className="text-3xl">P</span>oké<span className="text-3xl">P</span>lay
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Pokédex
                </Link>
                <Link
                  to="/team"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/team") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Team Builder
                </Link>
                <Link
                  to="/battle"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/battle") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Battle
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/history") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Battle History
                </Link>
                <Link
                  to="/favorites"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/favorites")
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Favorites
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {playerProfile?.username?.charAt(0).toUpperCase() || "T"}
                </div>
                <span>{playerProfile?.username || "Trainer"}</span>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
            >
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Pokédex
            </Link>
            <Link
              to="/team"
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/team") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Team Builder
            </Link>
            <Link
              to="/battle"
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/battle") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Battle
            </Link>
            <Link
              to="/history"
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/history") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Battle History
            </Link>
            <Link
              to="/favorites"
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/favorites") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <HeartIcon className="h-5 w-5 mr-1" />
                Favorites
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {playerProfile?.username?.charAt(0).toUpperCase() || "T"}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">
                  {playerProfile?.username || "Trainer"}
                </div>
                <div className="text-sm font-medium leading-none text-gray-400 mt-1">
                  Battles: {playerProfile?.totalBattles || 0}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to="/profile"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Your Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
