"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Moon, Sun, Droplets, HelpCircle } from "lucide-react"
import GettingStartedModal from "./GettingStartedModal"

interface HeaderProps {
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const [showHelp, setShowHelp] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center text-blue-600 dark:text-blue-400">
              <Droplets className="mr-2 h-7 w-7" /> Flow Tracker
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor Your Measurements</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-700" />}
            </button>
          </div>
        </div>
      </div>

      {showHelp && <GettingStartedModal onClose={() => setShowHelp(false)} />}
    </header>
  )
}

export default Header
