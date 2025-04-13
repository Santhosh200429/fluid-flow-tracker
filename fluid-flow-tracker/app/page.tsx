"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import FlowEntryForm from "./components/FlowEntryForm"
import FluidStats from "./components/FluidStats"
import ReferenceCharts from "./components/ReferenceCharts"
import UrineColorChart from "./components/UrineColorChart"
import DataManagement from "./components/DataManagement"
import Resources from "./components/Resources"
import InstallPrompt from "./components/InstallPrompt"
import type { FlowEntry } from "./types"

export default function Home() {
  const [entries, setEntries] = useState<FlowEntry[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true)
    }

    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true")
    }

    // Load saved entries
    const savedEntries = localStorage.getItem("flowEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }

    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("flowEntries", JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const addEntry = (entry: FlowEntry) => {
    setEntries([...entries, entry])
  }

  return (
    <main className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-4 pb-20">
          {!isOnline && (
            <div className="mb-6 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-lg flex items-center justify-center shadow-sm animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              You're currently offline. Your data is saved locally.
            </div>
          )}

          <div className="space-y-6">
            <FlowEntryForm addEntry={addEntry} entries={entries} />
            <FluidStats entries={entries} />
            <ReferenceCharts />
            <UrineColorChart />
            <DataManagement entries={entries} setEntries={setEntries} />
            <Resources />
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <p className="font-medium mb-2">Disclaimer:</p>
              <p className="mb-2">
                This application is for informational and personal tracking purposes only. Nothing on this app
                constitutes legal, professional, or medical advice. Always consult a licensed healthcare provider or
                professional for medical concerns or guidance.
              </p>
              <p>
                This application and its content are not intended for commercial use or profit. All content is provided
                as-is without warranty of any kind.
              </p>
            </div>
          </div>
        </div>

        <InstallPrompt />
      </div>
    </main>
  )
}
