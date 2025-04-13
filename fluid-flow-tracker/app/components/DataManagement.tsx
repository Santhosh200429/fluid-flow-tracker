"use client"

import type React from "react"
import { useState } from "react"
import {
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Trash2,
  BarChart,
  Droplet,
  Clock,
  Calendar,
  Coffee,
  Database,
  Trash,
} from "lucide-react"
import type { FlowEntry } from "../types"
import CollapsibleSection from "./CollapsibleSection"
import BackupRestore from "./BackupRestore"

interface DataManagementProps {
  entries: FlowEntry[]
  setEntries: (entries: FlowEntry[]) => void
}

interface MonthlyGroup {
  key: string
  label: string
  entries: FlowEntry[]
  averageFlowRate: number
  averageVolume: number
  averageDuration: number
}

const DataManagement: React.FC<DataManagementProps> = ({ entries, setEntries }) => {
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})

  const generateMockData = () => {
    if (!confirm("This will generate 3 months of mock data (3 entries per day). Continue?")) {
      return
    }

    const mockEntries: FlowEntry[] = []
    const today = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(today.getMonth() - 3)

    // Loop through each day in the 3-month period
    for (
      let currentDate = new Date(threeMonthsAgo);
      currentDate <= today;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      // Create 3 entries for each day
      for (let i = 0; i < 3; i++) {
        const entryTime = new Date(currentDate)

        // Set different times for the 3 entries
        if (i === 0) {
          entryTime.setHours(7, Math.floor(Math.random() * 60), 0) // Morning
        } else if (i === 1) {
          entryTime.setHours(13, Math.floor(Math.random() * 60), 0) // Afternoon
        } else {
          entryTime.setHours(20, Math.floor(Math.random() * 60), 0) // Evening
        }

        // Generate random flow data
        const volume = Math.floor(Math.random() * 300) + 200 // 200-500 mL
        const duration = Math.floor(Math.random() * 40) + 30 // 30-70 seconds
        const flowRate = volume / duration

        // Generate random fluid intake data
        const fluidTypes = ["Water", "Coffee", "Tea", "Juice", "Soda"]
        const fluidType = fluidTypes[Math.floor(Math.random() * fluidTypes.length)] as any
        const fluidAmount = Math.floor(Math.random() * 300) + 200 // 200-500 mL

        mockEntries.push({
          timestamp: entryTime.toISOString(),
          volume,
          duration,
          flowRate,
          notes: "Mock data to be removed",
          fluidIntake: {
            type: fluidType,
            amount: fluidAmount,
            unit: "mL",
          },
        })
      }
    }

    setEntries([...entries, ...mockEntries])
  }

  const deleteMockData = () => {
    if (!confirm("This will delete all mock data entries. Continue?")) {
      return
    }

    const realEntries = entries.filter((entry) => entry.notes !== "Mock data to be removed")
    setEntries(realEntries)
  }

  // Check if we have any mock data
  const hasMockData = entries.some((entry) => entry.notes === "Mock data to be removed")

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Time,Volume (mL),Duration (s),Flow Rate (mL/s),Color,Urgency,Concerns,Notes,Fluid Type,Fluid Custom Type,Fluid Amount,Fluid Unit\n" +
      entries
        .map((e) => {
          const date = new Date(e.timestamp)
          const dateStr = date.toISOString().split("T")[0]
          const timeStr = date.toTimeString().substring(0, 8)

          // Handle fluid intake data
          const fluidType = e.fluidIntake?.type || ""
          const fluidCustomType = e.fluidIntake?.customType || ""
          const fluidAmount = e.fluidIntake?.amount || ""
          const fluidUnit = e.fluidIntake?.unit || ""

          return `${dateStr},${timeStr},${e.volume},${e.duration},${e.flowRate},${e.color || ""},${e.urgency || ""},"${
            e.concerns ? e.concerns.join("; ") : ""
          }","${e.notes ? e.notes.replace(/"/g, '""') : ""}","${fluidType}","${fluidCustomType}","${fluidAmount}","${fluidUnit}"`
        })
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "flow_tracker_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split("\n")

          // Parse CSV, handling quoted fields properly
          const parseCSVLine = (line: string) => {
            const result = []
            let current = ""
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
              const char = line[i]

              if (char === '"') {
                // Handle escaped quotes (two double quotes in a row)
                if (i + 1 < line.length && line[i + 1] === '"') {
                  current += '"'
                  i++ // Skip the next quote
                } else {
                  inQuotes = !inQuotes
                }
              } else if (char === "," && !inQuotes) {
                result.push(current)
                current = ""
              } else {
                current += char
              }
            }

            result.push(current) // Add the last field
            return result
          }

          // Check the header to determine the format
          const header = lines[0].toLowerCase()
          const isNewFormat = header.includes("date") && header.includes("time")

          const newEntries: FlowEntry[] = []

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            try {
              const fields = parseCSVLine(line)

              if (isNewFormat) {
                // Handle the new format: Date,Time,Duration (s),Volume (ml),Rate (ml/s)
                // Parse date and time
                const dateStr = fields[0].replace(/"/g, "").trim()
                const timeStr = fields[1].replace(/"/g, "").trim()

                // Create timestamp - handle various date formats
                let timestamp
                try {
                  // Try to parse the date in MM/DD/YY format
                  const dateParts = dateStr.split("/")
                  if (dateParts.length === 3) {
                    // Handle 2-digit year
                    if (dateParts[2].length === 2) {
                      dateParts[2] = "20" + dateParts[2]
                    }

                    // Format as YYYY-MM-DD for ISO date
                    const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`

                    // Parse time - handle AM/PM format
                    let formattedTime = timeStr
                    if (timeStr.includes("AM") || timeStr.includes("PM")) {
                      // Convert 12-hour format to 24-hour format
                      const timeParts = timeStr.match(/(\d+):(\d+)\s*([AP]M)/)
                      if (timeParts) {
                        let hours = Number.parseInt(timeParts[1])
                        const minutes = timeParts[2]
                        const ampm = timeParts[3]

                        if (ampm === "PM" && hours < 12) hours += 12
                        if (ampm === "AM" && hours === 12) hours = 0

                        formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`
                      }
                    }

                    timestamp = new Date(`${formattedDate}T${formattedTime}`).toISOString()
                  } else {
                    // Try direct parsing if not in MM/DD/YY format
                    timestamp = new Date(`${dateStr}T${timeStr}`).toISOString()
                  }
                } catch (error) {
                  console.error("Error parsing date/time:", dateStr, timeStr, error)
                  // Use current timestamp as fallback
                  timestamp = new Date().toISOString()
                }

                // Parse other fields - column order is different in the new format
                const duration = Number.parseFloat(fields[2])
                const volume = Number.parseFloat(fields[3])
                const flowRate = Number.parseFloat(fields[4])

                newEntries.push({
                  timestamp,
                  volume,
                  duration,
                  flowRate,
                })
              } else {
                // Handle the old format
                const timestamp = fields[0]
                const volume = Number.parseFloat(fields[1])
                const duration = Number.parseFloat(fields[2])
                const flowRate = Number.parseFloat(fields[3])

                newEntries.push({
                  timestamp,
                  volume,
                  duration,
                  flowRate,
                })
              }
            } catch (error) {
              console.error("Error parsing CSV line:", line, error)
              // Continue with next line
            }
          }

          if (newEntries.length > 0) {
            setEntries([...entries, ...newEntries])
          }
        } catch (error) {
          console.error("Error processing CSV file:", error)
          alert("Error processing CSV file. Please check the format.")
        }
      }
      reader.readAsText(file)
      // Reset the input
      event.target.value = ""
    }
  }

  const deleteEntry = (timestamp: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setEntries(entries.filter((entry) => entry.timestamp !== timestamp))
    }
  }

  const toggleMonthExpand = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }))
  }

  // Group entries by month and year
  const groupEntriesByMonth = (): MonthlyGroup[] => {
    const groups: Record<string, FlowEntry[]> = {}

    // Sort entries by timestamp (newest first)
    const sortedEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    sortedEntries.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!groups[monthYear]) {
        groups[monthYear] = []
      }

      groups[monthYear].push(entry)
    })

    // Calculate averages for each month
    return Object.entries(groups).map(([key, monthEntries]) => {
      const date = new Date(monthEntries[0].timestamp)
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

      const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

      const averageFlowRate = monthEntries.reduce((sum, entry) => sum + entry.flowRate, 0) / monthEntries.length
      const averageVolume = monthEntries.reduce((sum, entry) => sum + entry.volume, 0) / monthEntries.length
      const averageDuration = monthEntries.reduce((sum, entry) => sum + entry.duration, 0) / monthEntries.length

      return {
        key,
        label,
        entries: monthEntries,
        averageFlowRate,
        averageVolume,
        averageDuration,
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const monthlyGroups = groupEntriesByMonth()

  return (
    <CollapsibleSection title="Data Management" defaultExpanded={false}>
      <div className="mb-4">
        {entries.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No entries yet. Add your first flow entry or generate mock data.
            </p>
            <button
              onClick={generateMockData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center mx-auto shadow-sm font-medium"
            >
              <Database className="mr-2" size={18} /> Generate Mock Data
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            {hasMockData && (
              <button
                onClick={deleteMockData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center shadow-sm font-medium"
              >
                <Trash className="mr-2" size={18} /> Delete All Mock Data
              </button>
            )}
            <button
              onClick={generateMockData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Database className="mr-2" size={18} /> Generate Mock Data
            </button>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-4">Entry Logs</h3>

      {monthlyGroups.length === 0 ? (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400 border rounded-lg">
          No entries yet. Add your first flow entry above.
        </div>
      ) : (
        <div className="space-y-4">
          {monthlyGroups.map((group) => (
            <div key={group.key} className="border rounded-lg overflow-hidden">
              <div
                className="bg-gray-100 dark:bg-gray-700 p-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleMonthExpand(group.key)}
              >
                <div className="font-medium flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {group.label} ({group.entries.length} entries)
                </div>
                <div className="flex items-center">
                  <div className="text-blue-600 dark:text-blue-400 font-bold mr-4">
                    Avg: {group.averageFlowRate.toFixed(1)} mL/s
                  </div>
                  {expandedMonths[group.key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedMonths[group.key] && (
                <div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800 border-b">
                    <div className="flex items-center">
                      <BarChart className="mr-2 text-blue-500" size={18} />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Avg Flow Rate</div>
                        <div className="font-medium">{group.averageFlowRate.toFixed(1)} mL/s</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Droplet className="mr-2 text-green-500" size={18} />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Avg Volume</div>
                        <div className="font-medium">{group.averageVolume.toFixed(0)} mL</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 text-purple-500" size={18} />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</div>
                        <div className="font-medium">{group.averageDuration.toFixed(1)} sec</div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y">
                    {group.entries.map((entry) => (
                      <div key={entry.timestamp} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start">
                            <div className="mr-4">
                              <div className="font-medium">{formatDate(entry.timestamp)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="mr-4 text-right">
                              <div className="font-bold text-blue-600 dark:text-blue-400">
                                {entry.flowRate.toFixed(1)} mL/s
                              </div>
                              <div className="text-sm">
                                {entry.volume} mL in {entry.duration.toFixed(1)}s
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteEntry(entry.timestamp)
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              aria-label="Delete entry"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {entry.color && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Color:</span> {entry.color}
                            </div>
                          )}

                          {entry.urgency && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Urgency:</span> {entry.urgency}
                            </div>
                          )}
                        </div>

                        {entry.fluidIntake && (
                          <div className="mt-2 flex items-center">
                            <Coffee size={16} className="mr-1 text-cyan-500" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm mr-1">Fluid Intake:</span>
                            <span>
                              {entry.fluidIntake.type === "Other" && entry.fluidIntake.customType
                                ? entry.fluidIntake.customType
                                : entry.fluidIntake.type}{" "}
                              ({entry.fluidIntake.amount} {entry.fluidIntake.unit})
                            </span>
                          </div>
                        )}

                        {entry.concerns && entry.concerns.length > 0 && (
                          <div className="mt-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Concerns:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.concerns.map((concern, i) => (
                                <span
                                  key={i}
                                  className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-0.5 rounded"
                                >
                                  {concern}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.notes && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">{entry.notes}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BackupRestore entries={entries} setEntries={setEntries} />

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">CSV Export/Import</h3>

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <p>
            <strong>Export to CSV:</strong> Creates a spreadsheet file with all your data that can be opened in Excel or
            Google Sheets.
          </p>
          <p className="mt-1">
            <strong>Import from CSV:</strong> Loads data from a previously exported CSV file or from the format:
            <br />
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
              Date,Time,Duration (s),Volume (ml),Rate (ml/s)
            </code>
          </p>
        </div>

        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4">
            <button
              onClick={exportData}
              className="w-full p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-sm font-medium"
            >
              <Download className="mr-2" /> Export to CSV
            </button>
          </div>
          <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="w-full p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center cursor-pointer shadow-sm font-medium">
              <Upload className="mr-2" /> Import from CSV
              <input type="file" accept=".csv" onChange={importData} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}

export default DataManagement
