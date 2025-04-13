"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Play, Pause, Plus, RotateCcw, Droplet, Clock, AlertTriangle, FileText, Calendar, Coffee } from "lucide-react"
import type { FlowEntry, UrineColor, UrgencyRating, ConcernType, FluidType, FluidIntake } from "../types"
import CollapsibleSection from "./CollapsibleSection"

interface FlowEntryFormProps {
  addEntry: (entry: FlowEntry) => void
  entries: FlowEntry[]
}

const FlowEntryForm: React.FC<FlowEntryFormProps> = ({ addEntry, entries }) => {
  const [volume, setVolume] = useState("")
  const [duration, setDuration] = useState("")
  const [color, setColor] = useState<UrineColor>("")
  const [urgency, setUrgency] = useState<UrgencyRating>("")
  const [concerns, setConcerns] = useState<ConcernType[]>([])
  const [notes, setNotes] = useState("")
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStart, setTimerStart] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "fluid">("basic")
  const [calculatedFlowRate, setCalculatedFlowRate] = useState<number | null>(null)

  // Averages for comparison
  const [overallAverage, setOverallAverage] = useState<number>(0)
  const [weekAverage, setWeekAverage] = useState<number>(0)
  const [monthAverage, setMonthAverage] = useState<number>(0)
  const [dayAverage, setDayAverage] = useState<number>(0)

  // Fluid intake fields
  const [fluidType, setFluidType] = useState<FluidType>("")
  const [customFluidType, setCustomFluidType] = useState("")
  const [fluidAmount, setFluidAmount] = useState("")
  const [fluidUnit, setFluidUnit] = useState<"oz" | "mL">("mL")
  const [useCustomAmount, setUseCustomAmount] = useState(false)

  // Date and time override fields
  const [entryDate, setEntryDate] = useState("")
  const [entryTime, setEntryTime] = useState("")
  const [useCustomDateTime, setUseCustomDateTime] = useState(false)

  const colorOptions: { value: UrineColor; label: string; bgColor: string; textColor: string }[] = [
    { value: "", label: "Select color (optional)", bgColor: "bg-white dark:bg-gray-700", textColor: "text-gray-500" },
    { value: "Light Yellow", label: "Light Yellow", bgColor: "bg-yellow-200", textColor: "text-yellow-800" },
    { value: "Clear", label: "Clear", bgColor: "bg-gray-100", textColor: "text-gray-800" },
    { value: "Dark Yellow", label: "Dark Yellow", bgColor: "bg-yellow-300", textColor: "text-yellow-800" },
    { value: "Amber or Honey", label: "Amber or Honey", bgColor: "bg-amber-300", textColor: "text-amber-800" },
    { value: "Orange", label: "Orange", bgColor: "bg-orange-300", textColor: "text-orange-800" },
    { value: "Pink or Red", label: "Pink or Red", bgColor: "bg-red-200", textColor: "text-red-800" },
    { value: "Blue or Green", label: "Blue or Green", bgColor: "bg-teal-200", textColor: "text-teal-800" },
    {
      value: "Brown or Cola-colored",
      label: "Brown or Cola-colored",
      bgColor: "bg-amber-700",
      textColor: "text-white",
    },
    { value: "Cloudy or Murky", label: "Cloudy or Murky", bgColor: "bg-gray-300", textColor: "text-gray-800" },
    { value: "Foamy or Bubbly", label: "Foamy or Bubbly", bgColor: "bg-blue-100", textColor: "text-blue-800" },
  ]

  const urgencyOptions: { value: UrgencyRating; label: string }[] = [
    { value: "", label: "Select urgency (optional)" },
    { value: "Normal", label: "Normal" },
    { value: "Hour < 60 min", label: "Hour < 60 min" },
    { value: "Hold < 15 min", label: "Hold < 15 min" },
    { value: "Hold < 5 minutes", label: "Hold < 5 minutes" },
    { value: "Had drips", label: "Had drips" },
    { value: "Couldn't hold it", label: "Couldn't hold it" },
  ]

  const fluidTypeOptions: { value: FluidType; label: string }[] = [
    { value: "", label: "Select type" },
    { value: "Water", label: "Water" },
    { value: "Juice", label: "Juice" },
    { value: "Tea", label: "Tea" },
    { value: "Soda", label: "Soda" },
    { value: "Coffee", label: "Coffee" },
    { value: "Alcohol", label: "Alcohol" },
    { value: "Other", label: "Other" },
  ]

  const commonSizes = [
    { label: "Small (8 oz / 240 mL)", oz: 8, mL: 240 },
    { label: "Medium (12 oz / 355 mL)", oz: 12, mL: 355 },
    { label: "Large (16 oz / 475 mL)", oz: 16, mL: 475 },
    { label: "Extra Large (20 oz / 590 mL)", oz: 20, mL: 590 },
    { label: "750 mL (25.4 oz)", oz: 25.4, mL: 750 },
    { label: "1000 mL (33.8 oz)", oz: 33.8, mL: 1000 },
  ]

  const concernOptions: ConcernType[] = [
    "Straining",
    "Dribbling",
    "Frequent urges",
    "Incomplete emptying",
    "Waking just to pee",
    "Pain",
    "Burning",
    "Blood",
  ]

  // Calculate averages from entries
  useEffect(() => {
    if (entries.length === 0) return

    // Overall average
    const allFlowRates = entries.map((entry) => entry.flowRate)
    setOverallAverage(allFlowRates.reduce((sum, rate) => sum + rate, 0) / allFlowRates.length)

    // Last 7 days average
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekEntries = entries.filter((entry) => new Date(entry.timestamp) >= oneWeekAgo)
    if (weekEntries.length > 0) {
      const weekRates = weekEntries.map((entry) => entry.flowRate)
      setWeekAverage(weekRates.reduce((sum, rate) => sum + rate, 0) / weekRates.length)
    }

    // Last month average
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const monthEntries = entries.filter((entry) => new Date(entry.timestamp) >= oneMonthAgo)
    if (monthEntries.length > 0) {
      const monthRates = monthEntries.map((entry) => entry.flowRate)
      setMonthAverage(monthRates.reduce((sum, rate) => sum + rate, 0) / monthRates.length)
    }

    // Today's average
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEntries = entries.filter((entry) => new Date(entry.timestamp) >= today)
    if (todayEntries.length > 0) {
      const todayRates = todayEntries.map((entry) => entry.flowRate)
      setDayAverage(todayRates.reduce((sum, rate) => sum + rate, 0) / todayRates.length)
    }
  }, [entries])

  // Initialize date and time fields with current values
  useEffect(() => {
    const now = new Date()
    setEntryDate(now.toISOString().split("T")[0])
    setEntryTime(now.toTimeString().substring(0, 5))
  }, [])

  // Calculate flow rate when volume or duration changes
  useEffect(() => {
    if (volume && duration && Number(volume) > 0 && Number(duration) > 0) {
      const flowRate = Number(volume) / Number(duration)
      setCalculatedFlowRate(flowRate)
    } else {
      setCalculatedFlowRate(null)
    }
  }, [volume, duration])

  const toggleConcern = (concern: ConcernType) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter((c) => c !== concern))
    } else {
      setConcerns([...concerns, concern])
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerStart) {
          const elapsed = (Date.now() - timerStart) / 1000
          setElapsedTime(elapsed)
        }
      }, 100)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timerStart])

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    const tenths = Math.floor((timeInSeconds * 10) % 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${tenths}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (volume && (duration || isTimerRunning)) {
      let durationValue = Number.parseFloat(duration)

      if (isTimerRunning && timerStart) {
        durationValue = (Date.now() - timerStart) / 1000
        setIsTimerRunning(false)
        setTimerStart(null)
        setElapsedTime(0)
      }

      // Create timestamp based on user input or current time
      let timestamp: string
      if (useCustomDateTime && entryDate && entryTime) {
        timestamp = new Date(`${entryDate}T${entryTime}`).toISOString()
      } else {
        timestamp = new Date().toISOString()
      }

      // Create fluid intake object if data is provided
      let fluidIntakeData: FluidIntake | undefined = undefined
      if (fluidType) {
        const amount = useCustomAmount
          ? Number(fluidAmount)
          : fluidUnit === "oz"
            ? commonSizes[Number(fluidAmount)].oz
            : commonSizes[Number(fluidAmount)].mL

        fluidIntakeData = {
          type: fluidType,
          customType: fluidType === "Other" ? customFluidType : undefined,
          amount,
          unit: fluidUnit,
        }
      }

      const flowRate = Number.parseFloat(volume) / durationValue
      addEntry({
        timestamp,
        volume: Number.parseFloat(volume),
        duration: durationValue,
        flowRate,
        color: color || undefined,
        urgency: urgency || undefined,
        concerns: concerns.length > 0 ? concerns : undefined,
        notes: notes || undefined,
        fluidIntake: fluidIntakeData,
      })
      setVolume("")
      setDuration("")
      setColor("")
      setUrgency("")
      setConcerns([])
      setNotes("")
      setFluidType("")
      setCustomFluidType("")
      setFluidAmount("")
      setUseCustomAmount(false)
      setCalculatedFlowRate(null)

      // Reset date and time to current
      const now = new Date()
      setEntryDate(now.toISOString().split("T")[0])
      setEntryTime(now.toTimeString().substring(0, 5))
      setUseCustomDateTime(false)

      // Collapse optional fields after submission
      setShowOptionalFields(false)
      setActiveTab("basic")
    }
  }

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false)
      if (timerStart) {
        const durationInSeconds = (Date.now() - timerStart) / 1000
        setDuration(durationInSeconds.toFixed(1))
        setElapsedTime(0)
      }
      setTimerStart(null)
    } else {
      setIsTimerRunning(true)
      setTimerStart(Date.now())
      setDuration("")
    }
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerStart(null)
    setElapsedTime(0)
    setDuration("")
  }

  const handleSizeSelection = (index: number) => {
    setFluidAmount(index.toString())
    setUseCustomAmount(false)
  }

  // Get comparison class for flow rate
  const getComparisonClass = (current: number, average: number) => {
    if (current > average * 1.1) return "text-green-600 dark:text-green-400"
    if (current < average * 0.9) return "text-red-600 dark:text-red-400"
    return "text-yellow-600 dark:text-yellow-400"
  }

  return (
    <CollapsibleSection title="Add New Entry" defaultExpanded={true}>
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "basic"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            } transition-colors`}
            onClick={() => setActiveTab("basic")}
          >
            Flow Entry
          </button>
          <button
            className={`px-4 py-3 font-medium flex items-center ${
              activeTab === "fluid"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            } transition-colors`}
            onClick={() => setActiveTab("fluid")}
          >
            <Coffee size={16} className="mr-2" />
            Fluid Intake
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-in">
        {activeTab === "basic" && (
          <div>
            <div className="flex flex-wrap -mx-2 mb-6">
              <div className="w-full px-2 mb-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="duration"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Duration (seconds)
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={toggleTimer}
                        className={`p-2.5 text-white rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-all ${
                          isTimerRunning ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                        <span className="ml-1.5 font-medium">{isTimerRunning ? "Stop" : "Start"} Timer</span>
                      </button>
                      <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => {
                          const val = Math.min(600, Number(e.target.value))
                          setDuration(val.toString())
                        }}
                        disabled={isTimerRunning}
                        className={`ml-3 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 w-24 ${
                          isTimerRunning ? "opacity-50" : ""
                        }`}
                        required={!isTimerRunning}
                        placeholder="Sec"
                        max={600}
                      />
                      {(isTimerRunning || elapsedTime > 0) && (
                        <button
                          type="button"
                          onClick={resetTimer}
                          className="p-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 ml-3 flex items-center shadow-sm hover:shadow transition-all"
                        >
                          <RotateCcw size={18} />
                          <span className="ml-1.5 font-medium">Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="volume" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Volume (mL)
                    </label>
                    <input
                      type="number"
                      id="volume"
                      value={volume}
                      onChange={(e) => {
                        const val = Math.min(800, Number(e.target.value))
                        setVolume(val.toString())
                      }}
                      className="w-24 p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      required
                      placeholder="mL"
                      max={800}
                    />
                  </div>
                </div>

                {isTimerRunning && (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center mt-4 shadow-inner">
                    <div className="text-3xl font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                      {formatTime(elapsedTime)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Timer Running</div>
                  </div>
                )}

                {calculatedFlowRate !== null && (
                  <div className="mt-5 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Calculated Flow Rate:</span>
                        <span className="ml-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                          {calculatedFlowRate.toFixed(1)} mL/s
                        </span>
                      </div>
                      {entries.length > 0 && (
                        <div className="text-sm">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            <span className="text-gray-500 dark:text-gray-400">Today's Avg:</span>
                            <span className={getComparisonClass(calculatedFlowRate, dayAverage)}>
                              {dayAverage.toFixed(1)} mL/s
                            </span>

                            <span className="text-gray-500 dark:text-gray-400">7-Day Avg:</span>
                            <span className={getComparisonClass(calculatedFlowRate, weekAverage)}>
                              {weekAverage.toFixed(1)} mL/s
                            </span>

                            <span className="text-gray-500 dark:text-gray-400">Month Avg:</span>
                            <span className={getComparisonClass(calculatedFlowRate, monthAverage)}>
                              {monthAverage.toFixed(1)} mL/s
                            </span>

                            <span className="text-gray-500 dark:text-gray-400">Overall Avg:</span>
                            <span className={getComparisonClass(calculatedFlowRate, overallAverage)}>
                              {overallAverage.toFixed(1)} mL/s
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="w-full p-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors font-medium"
              >
                {showOptionalFields ? "Hide Optional Fields" : "Show Optional Fields"}
              </button>
            </div>

            {showOptionalFields && (
              <div className="border-t pt-5 mb-6 animate-slide-up">
                <div className="mb-5">
                  <div className="flex items-center mb-2">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <label
                      htmlFor="custom-datetime"
                      className="flex items-center cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        id="custom-datetime"
                        checked={useCustomDateTime}
                        onChange={() => setUseCustomDateTime(!useCustomDateTime)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Override date and time (for manual entries)</span>
                    </label>
                  </div>

                  {useCustomDateTime && (
                    <div className="flex flex-wrap -mx-2 mb-4 animate-fade-in">
                      <div className="w-full md:w-1/2 px-2 mb-2 md:mb-0">
                        <label htmlFor="entry-date" className="block mb-1 text-sm text-gray-600 dark:text-gray-400">
                          Date
                        </label>
                        <input
                          type="date"
                          id="entry-date"
                          value={entryDate}
                          onChange={(e) => setEntryDate(e.target.value)}
                          className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="w-full md:w-1/2 px-2">
                        <label htmlFor="entry-time" className="block mb-1 text-sm text-gray-600 dark:text-gray-400">
                          Time
                        </label>
                        <input
                          type="time"
                          id="entry-time"
                          value={entryTime}
                          onChange={(e) => setEntryTime(e.target.value)}
                          className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap -mx-2 mb-5">
                  <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                    <label
                      htmlFor="color"
                      className="block mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <Droplet size={16} className="mr-2 text-blue-500" />
                      Urine Color
                    </label>
                    <div className="relative">
                      <select
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value as UrineColor)}
                        className="w-full p-2.5 pl-10 border rounded-lg appearance-none dark:bg-gray-700 dark:border-gray-600"
                      >
                        {colorOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Droplet
                          size={18}
                          className={
                            color
                              ? colorOptions.find((o) => o.value === color)?.textColor || "text-gray-400"
                              : "text-gray-400"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 px-2">
                    <label
                      htmlFor="urgency"
                      className="block mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <Clock size={16} className="mr-2 text-purple-500" />
                      Urgency Rating
                    </label>
                    <select
                      id="urgency"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as UrgencyRating)}
                      className="w-full p-2.5 border rounded-lg appearance-none dark:bg-gray-700 dark:border-gray-600"
                    >
                      {urgencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <AlertTriangle size={16} className="mr-2 text-amber-500" />
                    Concerns (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {concernOptions.map((concern) => (
                      <div
                        key={concern}
                        className={`flex items-center p-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                          concerns.includes(concern)
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
                            : ""
                        }`}
                        onClick={() => toggleConcern(concern)}
                      >
                        <input
                          type="checkbox"
                          id={`concern-${concern}`}
                          checked={concerns.includes(concern)}
                          onChange={() => toggleConcern(concern)}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`concern-${concern}`} className="text-sm cursor-pointer flex-1">
                          {concern}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="notes"
                    className="block mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <FileText size={16} className="mr-2 text-green-500" />
                    Notes (max 256 characters)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 256))}
                    maxLength={256}
                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
                    rows={3}
                    placeholder="Add any additional notes here..."
                  ></textarea>
                  <div className="text-right text-xs text-gray-500 mt-1">{notes.length}/256 characters</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "fluid" && (
          <div className="border-t pt-5 mb-6 animate-fade-in">
            <div className="mb-5">
              <label
                htmlFor="fluid-type"
                className="block mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Coffee size={16} className="mr-2 text-cyan-500" />
                Beverage Type
              </label>
              <select
                id="fluid-type"
                value={fluidType}
                onChange={(e) => setFluidType(e.target.value as FluidType)}
                className="w-full p-2.5 border rounded-lg appearance-none dark:bg-gray-700 dark:border-gray-600"
              >
                {fluidTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {fluidType === "Other" && (
              <div className="mb-5 animate-fade-in">
                <label
                  htmlFor="custom-fluid-type"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Specify Beverage
                </label>
                <input
                  type="text"
                  id="custom-fluid-type"
                  value={customFluidType}
                  onChange={(e) => setCustomFluidType(e.target.value)}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter beverage type"
                  required={fluidType === "Other"}
                />
              </div>
            )}

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Beverage Size</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {commonSizes.map((size, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      !useCustomAmount && fluidAmount === index.toString()
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shadow-sm"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleSizeSelection(index)}
                  >
                    <div className="font-medium">{size.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="custom-amount"
                  checked={useCustomAmount}
                  onChange={() => setUseCustomAmount(!useCustomAmount)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="custom-amount" className="cursor-pointer text-gray-700 dark:text-gray-300">
                  Custom amount
                </label>
              </div>

              {useCustomAmount && (
                <div className="flex items-center mt-3 animate-fade-in">
                  <input
                    type="number"
                    value={fluidAmount}
                    onChange={(e) => setFluidAmount(e.target.value)}
                    className="p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 w-28 mr-3"
                    placeholder="Amount"
                    required={useCustomAmount}
                    min="1"
                  />
                  <select
                    value={fluidUnit}
                    onChange={(e) => setFluidUnit(e.target.value as "oz" | "mL")}
                    className="p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="oz">oz</option>
                    <option value="mL">mL</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-sm hover:shadow transition-all font-medium"
        >
          <Plus className="mr-2" /> Add Entry
        </button>
      </form>
    </CollapsibleSection>
  )
}

export default FlowEntryForm
