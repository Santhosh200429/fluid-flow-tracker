"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  BarChartIcon,
  Calendar,
  Clock,
  Droplet,
  AlertTriangle,
  Coffee,
  TrendingUp,
  TrendingDown,
  LineChart,
  Grid,
  ScatterChart,
} from "lucide-react"
import type { FlowEntry } from "../types"
import CollapsibleSection from "./CollapsibleSection"

interface FluidStatsProps {
  entries: FlowEntry[]
}

const FluidStats: React.FC<FluidStatsProps> = ({ entries }) => {
  const [activeTab, setActiveTab] = useState<"table" | "line" | "heatmap" | "scatter">("table")
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const heatmapRef = useRef<HTMLCanvasElement>(null)
  const scatterRef = useRef<HTMLCanvasElement>(null)

  const calculateAverage = (values: number[]) => {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  const averageFlowRate = calculateAverage(entries.map((entry) => entry.flowRate))
  const averageVolume = calculateAverage(entries.map((entry) => entry.volume))
  const averageDuration = calculateAverage(entries.map((entry) => entry.duration))

  // Get recent entries (last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const recentEntries = entries.filter((entry) => new Date(entry.timestamp) >= oneWeekAgo)
  const recentAverageFlowRate = calculateAverage(recentEntries.map((entry) => entry.flowRate))

  // Get color distribution
  const entriesWithColor = entries.filter((entry) => entry.color)
  const colorCounts: Record<string, number> = {}
  entriesWithColor.forEach((entry) => {
    if (entry.color) {
      colorCounts[entry.color] = (colorCounts[entry.color] || 0) + 1
    }
  })

  // Get most common color
  let mostCommonColor = ""
  let maxColorCount = 0
  Object.entries(colorCounts).forEach(([color, count]) => {
    if (count > maxColorCount) {
      mostCommonColor = color
      maxColorCount = count
    }
  })

  // Get urgency distribution
  const entriesWithUrgency = entries.filter((entry) => entry.urgency)
  const urgencyCounts: Record<string, number> = {}
  entriesWithUrgency.forEach((entry) => {
    if (entry.urgency) {
      urgencyCounts[entry.urgency] = (urgencyCounts[entry.urgency] || 0) + 1
    }
  })

  // Get most common urgency
  let mostCommonUrgency = ""
  let maxUrgencyCount = 0
  Object.entries(urgencyCounts).forEach(([urgency, count]) => {
    if (count > maxUrgencyCount) {
      mostCommonUrgency = urgency
      maxUrgencyCount = count
    }
  })

  // Get concern distribution
  const concernCounts: Record<string, number> = {}
  entries.forEach((entry) => {
    if (entry.concerns && entry.concerns.length > 0) {
      entry.concerns.forEach((concern) => {
        concernCounts[concern] = (concernCounts[concern] || 0) + 1
      })
    }
  })

  // Get most common concern
  let mostCommonConcern = ""
  let maxConcernCount = 0
  Object.entries(concernCounts).forEach(([concern, count]) => {
    if (count > maxConcernCount) {
      mostCommonConcern = concern
      maxConcernCount = count
    }
  })

  // Fluid intake statistics
  const entriesWithFluidIntake = entries.filter((entry) => entry.fluidIntake)

  // Calculate average fluid intake
  const fluidIntakeAmounts = entriesWithFluidIntake.map((entry) => {
    const { fluidIntake } = entry
    if (!fluidIntake) return 0

    // Convert all to mL for consistency
    return fluidIntake.unit === "oz" ? fluidIntake.amount * 29.5735 : fluidIntake.amount
  })

  const averageFluidIntake = calculateAverage(fluidIntakeAmounts)

  // Get fluid type distribution
  const fluidTypeCounts: Record<string, number> = {}
  entriesWithFluidIntake.forEach((entry) => {
    if (entry.fluidIntake?.type) {
      const type =
        entry.fluidIntake.type === "Other" && entry.fluidIntake.customType
          ? entry.fluidIntake.customType
          : entry.fluidIntake.type

      fluidTypeCounts[type] = (fluidTypeCounts[type] || 0) + 1
    }
  })

  // Get most common fluid type
  let mostCommonFluidType = ""
  let maxFluidTypeCount = 0
  Object.entries(fluidTypeCounts).forEach(([type, count]) => {
    if (count > maxFluidTypeCount) {
      mostCommonFluidType = type
      maxFluidTypeCount = count
    }
  })

  // Check if fluid intake is trending up or down
  let fluidIntakeTrend: "up" | "down" | "stable" = "stable"
  if (entriesWithFluidIntake.length >= 4) {
    const sortedEntries = [...entriesWithFluidIntake].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const halfLength = Math.floor(sortedEntries.length / 2)
    const firstHalf = sortedEntries.slice(0, halfLength)
    const secondHalf = sortedEntries.slice(halfLength)

    const firstHalfAvg = calculateAverage(
      firstHalf.map((entry) => {
        if (!entry.fluidIntake) return 0
        return entry.fluidIntake.unit === "oz" ? entry.fluidIntake.amount * 29.5735 : entry.fluidIntake.amount
      }),
    )

    const secondHalfAvg = calculateAverage(
      secondHalf.map((entry) => {
        if (!entry.fluidIntake) return 0
        return entry.fluidIntake.unit === "oz" ? entry.fluidIntake.amount * 29.5735 : entry.fluidIntake.amount
      }),
    )

    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100

    if (percentChange > 5) {
      fluidIntakeTrend = "up"
    } else if (percentChange < -5) {
      fluidIntakeTrend = "down"
    }
  }

  // Draw line chart
  useEffect(() => {
    if (activeTab === "line" && lineChartRef.current && entries.length > 0) {
      const canvas = lineChartRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Sort entries by date
      const sortedEntries = [...entries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )

      // Prepare data
      const flowRates = sortedEntries.map((entry) => entry.flowRate)
      const fluidIntakes = sortedEntries.map((entry) => {
        if (!entry.fluidIntake) return 0
        return entry.fluidIntake.unit === "oz" ? entry.fluidIntake.amount * 29.5735 : entry.fluidIntake.amount
      })
      const dates = sortedEntries.map((entry) => new Date(entry.timestamp).toLocaleDateString())

      // Set chart dimensions
      const padding = 40
      const width = canvas.width - padding * 2
      const height = canvas.height - padding * 2

      // Find max values for scaling
      const maxFlowRate = Math.max(...flowRates) * 1.1
      const maxFluidIntake = Math.max(...fluidIntakes) * 1.1 || 1000

      // Draw axes
      ctx.beginPath()
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 1
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()

      // Draw flow rate line
      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      flowRates.forEach((rate, i) => {
        const x = padding + (i / (flowRates.length - 1)) * width
        const y = canvas.height - padding - (rate / maxFlowRate) * height
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw flow rate points
      flowRates.forEach((rate, i) => {
        const x = padding + (i / (flowRates.length - 1)) * width
        const y = canvas.height - padding - (rate / maxFlowRate) * height
        ctx.beginPath()
        ctx.fillStyle = "#3b82f6"
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw fluid intake line if data exists
      if (fluidIntakes.some((intake) => intake > 0)) {
        ctx.beginPath()
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 2

        let firstPoint = true
        fluidIntakes.forEach((intake, i) => {
          if (intake > 0) {
            const x = padding + (i / (fluidIntakes.length - 1)) * width
            const y = canvas.height - padding - (intake / maxFluidIntake) * height

            if (firstPoint) {
              ctx.moveTo(x, y)
              firstPoint = false
            } else {
              ctx.lineTo(x, y)
            }
          }
        })
        ctx.stroke()

        // Draw fluid intake points
        fluidIntakes.forEach((intake, i) => {
          if (intake > 0) {
            const x = padding + (i / (fluidIntakes.length - 1)) * width
            const y = canvas.height - padding - (intake / maxFluidIntake) * height
            ctx.beginPath()
            ctx.fillStyle = "#10b981"
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      }

      // Draw labels
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      // X-axis labels (dates)
      if (dates.length > 10) {
        // If too many dates, show fewer labels
        const step = Math.ceil(dates.length / 10)
        for (let i = 0; i < dates.length; i += step) {
          const x = padding + (i / (dates.length - 1)) * width
          ctx.fillText(dates[i], x, canvas.height - padding + 15)
        }
      } else {
        dates.forEach((date, i) => {
          const x = padding + (i / (dates.length - 1)) * width
          ctx.fillText(date, x, canvas.height - padding + 15)
        })
      }

      // Y-axis labels (flow rate)
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = (maxFlowRate * i) / 5
        const y = canvas.height - padding - (value / maxFlowRate) * height
        ctx.fillStyle = "#3b82f6"
        ctx.fillText(value.toFixed(1) + " mL/s", padding - 5, y + 4)
      }

      // Y-axis labels (fluid intake)
      ctx.textAlign = "left"
      for (let i = 0; i <= 5; i++) {
        const value = (maxFluidIntake * i) / 5
        const y = canvas.height - padding - (value / maxFluidIntake) * height
        ctx.fillStyle = "#10b981"
        ctx.fillText(value.toFixed(0) + " mL", canvas.width - padding + 5, y + 4)
      }

      // Legend
      ctx.textAlign = "left"
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(padding, 15, 15, 15)
      ctx.fillStyle = "#000"
      ctx.fillText("Flow Rate", padding + 20, 25)

      ctx.fillStyle = "#10b981"
      ctx.fillRect(padding + 100, 15, 15, 15)
      ctx.fillStyle = "#000"
      ctx.fillText("Fluid Intake", padding + 120, 25)
    }
  }, [activeTab, entries])

  // Draw heatmap
  useEffect(() => {
    if (activeTab === "heatmap" && heatmapRef.current && entries.length > 0) {
      const canvas = heatmapRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Group entries by day and hour
      const heatmapData: Record<string, Record<number, number[]>> = {}

      entries.forEach((entry) => {
        const date = new Date(entry.timestamp)
        const day = date.getDay() // 0-6 (Sunday-Saturday)
        const hour = date.getHours() // 0-23

        if (!heatmapData[day]) {
          heatmapData[day] = {}
        }

        if (!heatmapData[day][hour]) {
          heatmapData[day][hour] = []
        }

        heatmapData[day][hour].push(entry.flowRate)
      })

      // Set chart dimensions
      const padding = 40
      const cellWidth = (canvas.width - padding * 2) / 24 // 24 hours
      const cellHeight = (canvas.height - padding * 2) / 7 // 7 days

      // Draw grid
      ctx.strokeStyle = "#ddd"
      ctx.lineWidth = 1

      // Vertical lines (hours)
      for (let i = 0; i <= 24; i++) {
        const x = padding + i * cellWidth
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, canvas.height - padding)
        ctx.stroke()
      }

      // Horizontal lines (days)
      for (let i = 0; i <= 7; i++) {
        const y = padding + i * cellHeight
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
      }

      // Draw heatmap cells
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const values = heatmapData[day]?.[hour] || []
          if (values.length > 0) {
            const avgValue = calculateAverage(values)

            // Color based on value (blue to red gradient)
            const intensity = Math.min(1, avgValue / 20) // Normalize to 0-1 range
            const r = Math.floor(intensity * 255)
            const g = Math.floor((1 - intensity) * 100)
            const b = Math.floor((1 - intensity) * 255)

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

            const x = padding + hour * cellWidth
            const y = padding + day * cellHeight
            ctx.fillRect(x, y, cellWidth, cellHeight)

            // Add text for average value
            ctx.fillStyle = intensity > 0.5 ? "white" : "black"
            ctx.font = "10px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(avgValue.toFixed(1), x + cellWidth / 2, y + cellHeight / 2)
          }
        }
      }

      // Draw labels
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      // Hour labels
      for (let i = 0; i < 24; i += 3) {
        const x = padding + (i + 0.5) * cellWidth
        ctx.fillText(`${i}:00`, x, canvas.height - padding + 15)
      }

      // Day labels
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      for (let i = 0; i < 7; i++) {
        const y = padding + (i + 0.5) * cellHeight
        ctx.textAlign = "right"
        ctx.fillText(days[i], padding - 5, y)
      }

      // Title
      ctx.textAlign = "center"
      ctx.font = "14px Arial"
      ctx.fillText("Flow Rate by Day and Hour (mL/s)", canvas.width / 2, 20)
    }
  }, [activeTab, entries])

  // Draw scatter plot
  useEffect(() => {
    if (activeTab === "scatter" && scatterRef.current && entries.length > 0) {
      const canvas = scatterRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Filter entries with both flow and fluid intake data
      const validEntries = entries.filter((entry) => entry.fluidIntake)

      if (validEntries.length === 0) {
        ctx.fillStyle = "#666"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Not enough data for scatter plot", canvas.width / 2, canvas.height / 2)
        return
      }

      // Prepare data
      const data = validEntries.map((entry) => {
        const fluidIntake = entry.fluidIntake
          ? entry.fluidIntake.unit === "oz"
            ? entry.fluidIntake.amount * 29.5735
            : entry.fluidIntake.amount
          : 0
        return {
          flowRate: entry.flowRate,
          fluidIntake,
          timestamp: entry.timestamp,
        }
      })

      // Set chart dimensions
      const padding = 50
      const width = canvas.width - padding * 2
      const height = canvas.height - padding * 2

      // Find max values for scaling
      const maxFlowRate = Math.max(...data.map((d) => d.flowRate)) * 1.1
      const maxFluidIntake = Math.max(...data.map((d) => d.fluidIntake)) * 1.1

      // Draw axes
      ctx.beginPath()
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 1
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()

      // Draw scatter points
      data.forEach((point) => {
        const x = padding + (point.fluidIntake / maxFluidIntake) * width
        const y = canvas.height - padding - (point.flowRate / maxFlowRate) * height

        // Calculate point color based on recency
        const date = new Date(point.timestamp)
        const now = new Date()
        const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        const opacity = Math.max(0.3, 1 - daysDiff / 30) // Fade over 30 days

        ctx.beginPath()
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw trend line if enough points
      if (data.length >= 3) {
        // Simple linear regression
        let sumX = 0,
          sumY = 0,
          sumXY = 0,
          sumX2 = 0
        const n = data.length

        data.forEach((point) => {
          sumX += point.fluidIntake
          sumY += point.flowRate
          sumXY += point.fluidIntake * point.flowRate
          sumX2 += point.fluidIntake * point.fluidIntake
        })

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n

        // Draw trend line
        ctx.beginPath()
        ctx.strokeStyle = "rgba(239, 68, 68, 0.7)"
        ctx.lineWidth = 2

        const x1 = padding
        const y1 = canvas.height - padding - (intercept / maxFlowRate) * height
        const x2 = canvas.width - padding
        const y2 = canvas.height - padding - ((slope * maxFluidIntake + intercept) / maxFlowRate) * height

        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Draw labels
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"

      // X-axis labels (fluid intake)
      ctx.textAlign = "center"
      for (let i = 0; i <= 5; i++) {
        const value = (maxFluidIntake * i) / 5
        const x = padding + (value / maxFluidIntake) * width
        ctx.fillText(value.toFixed(0) + " mL", x, canvas.height - padding + 15)
      }

      // Y-axis labels (flow rate)
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = (maxFlowRate * i) / 5
        const y = canvas.height - padding - (value / maxFlowRate) * height
        ctx.fillText(value.toFixed(1) + " mL/s", padding - 5, y + 4)
      }

      // Axis titles
      ctx.textAlign = "center"
      ctx.font = "14px Arial"
      ctx.fillText("Fluid Intake (mL)", canvas.width / 2, canvas.height - 10)

      ctx.save()
      ctx.translate(15, canvas.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText("Flow Rate (mL/s)", 0, 0)
      ctx.restore()

      // Chart title
      ctx.textAlign = "center"
      ctx.font = "16px Arial"
      ctx.fillText("Flow Rate vs. Fluid Intake", canvas.width / 2, 20)
    }
  }, [activeTab, entries])

  return (
    <CollapsibleSection title="Fluid Stats" defaultExpanded={true}>
      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === "table"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("table")}
          >
            <BarChartIcon size={16} className="mr-2" />
            Summary
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === "line"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("line")}
          >
            <LineChart size={16} className="mr-2" />
            Line Chart
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === "heatmap"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("heatmap")}
          >
            <Grid size={16} className="mr-2" />
            Heat Map
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === "scatter"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("scatter")}
          >
            <ScatterChart size={16} className="mr-2" />
            Scatter Plot
          </button>
        </div>
      </div>

      {activeTab === "table" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BarChartIcon className="mr-3 text-blue-500" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Flow Rate</p>
                <p className="text-xl font-bold">{averageFlowRate.toFixed(2)} mL/s</p>
                {recentEntries.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 days: {recentAverageFlowRate.toFixed(2)} mL/s
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Droplet className="mr-3 text-green-500" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Volume</p>
                <p className="text-xl font-bold">{averageVolume.toFixed(0)} mL</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="mr-3 text-purple-500" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Duration</p>
                <p className="text-xl font-bold">{averageDuration.toFixed(1)} sec</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Calendar className="mr-3 text-amber-500" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
                <p className="text-xl font-bold">{entries.length}</p>
                {recentEntries.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days: {recentEntries.length}</p>
                )}
              </div>
            </div>
          </div>

          {entriesWithFluidIntake.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Fluid Intake Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <Coffee className="mr-3 text-cyan-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Fluid Intake</p>
                    <p className="text-xl font-bold">{averageFluidIntake.toFixed(0)} mL</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ({(averageFluidIntake / 29.5735).toFixed(1)} oz)
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  {fluidIntakeTrend === "up" ? (
                    <TrendingUp className="mr-3 text-green-500" size={24} />
                  ) : fluidIntakeTrend === "down" ? (
                    <TrendingDown className="mr-3 text-red-500" size={24} />
                  ) : (
                    <Coffee className="mr-3 text-indigo-500" size={24} />
                  )}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fluid Intake Trend</p>
                    <p className="text-xl font-bold">
                      {fluidIntakeTrend === "up" ? "Increasing" : fluidIntakeTrend === "down" ? "Decreasing" : "Stable"}
                    </p>
                    {mostCommonFluidType && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Most common: {mostCommonFluidType}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(entriesWithColor.length > 0 || entriesWithUrgency.length > 0 || Object.keys(concernCounts).length > 0) && (
            <div className="mt-6 space-y-4">
              {entriesWithColor.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Color Distribution</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Droplet className="mr-2" />
                      <span className="font-medium">Most common color: </span>
                      <span className="ml-2">{mostCommonColor}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(colorCounts).map(([color, count]) => (
                        <div
                          key={color}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span>{color}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {entriesWithUrgency.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Urgency Distribution</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Clock className="mr-2" />
                      <span className="font-medium">Most common urgency: </span>
                      <span className="ml-2">{mostCommonUrgency}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(urgencyCounts).map(([urgency, count]) => (
                        <div
                          key={urgency}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span>{urgency}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(concernCounts).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reported Concerns</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    {maxConcernCount > 0 && (
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="mr-2" />
                        <span className="font-medium">Most common concern: </span>
                        <span className="ml-2">{mostCommonConcern}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(concernCounts).map(([concern, count]) => (
                        <div
                          key={concern}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span>{concern}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {entriesWithFluidIntake.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Fluid Type Distribution</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Coffee className="mr-2" />
                      <span className="font-medium">Most common beverage: </span>
                      <span className="ml-2">{mostCommonFluidType}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(fluidTypeCounts).map(([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span>{type}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "line" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <canvas ref={lineChartRef} width={800} height={400} className="w-full h-auto" />
          {entries.length === 0 && (
            <div className="text-center p-4 text-gray-500">No data available. Add entries to see the line chart.</div>
          )}
        </div>
      )}

      {activeTab === "heatmap" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <canvas ref={heatmapRef} width={800} height={400} className="w-full h-auto" />
          {entries.length === 0 && (
            <div className="text-center p-4 text-gray-500">No data available. Add entries to see the heat map.</div>
          )}
        </div>
      )}

      {activeTab === "scatter" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <canvas ref={scatterRef} width={800} height={400} className="w-full h-auto" />
          {entries.length === 0 && (
            <div className="text-center p-4 text-gray-500">No data available. Add entries to see the scatter plot.</div>
          )}
        </div>
      )}
    </CollapsibleSection>
  )
}

export default FluidStats
