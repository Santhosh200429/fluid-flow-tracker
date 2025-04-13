"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  ExternalLink,
  BookOpen,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Link,
  Tag,
  Utensils,
  Dumbbell,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import CollapsibleSection from "./CollapsibleSection"
import type { CustomResource } from "../types"

const Resources: React.FC = () => {
  const [customResources, setCustomResources] = useState<CustomResource[]>([])
  const [newResourceTitle, setNewResourceTitle] = useState("")
  const [newResourceUrl, setNewResourceUrl] = useState("")
  const [newResourceCategory, setNewResourceCategory] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [formError, setFormError] = useState("")
  const [showDietary, setShowDietary] = useState(false)
  const [showExercise, setShowExercise] = useState(false)
  const [showOfficialResources, setShowOfficialResources] = useState(true)

  // Default resources
  const defaultResources = [
    {
      title: "Urethral Stricture - Diagnosis and Treatment",
      url: "https://www.mayoclinic.org/diseases-conditions/urethral-stricture/diagnosis-treatment/drc-20351735",
      icon: <FileText className="mr-2" size={16} />,
    },
    {
      title: "Urethral Stricture Disease: Symptoms, Diagnosis & Treatment",
      url: "https://www.urologyhealth.org/urology-a-z/u/urethral-stricture-disease",
      icon: <FileText className="mr-2" size={16} />,
    },
    {
      title: "Benign Prostatic Hyperplasia (BPH) - Mayo Clinic",
      url: "https://www.mayoclinic.org/diseases-conditions/benign-prostatic-hyperplasia/symptoms-causes/syc-20370087",
      icon: <BookOpen className="mr-2" size={16} />,
    },
    {
      title: "Benign Prostatic Hyperplasia (BPH)",
      url: "https://www.urologyhealth.org/urology-a-z/b/benign-prostatic-hyperplasia-(bph)",
      icon: <BookOpen className="mr-2" size={16} />,
    },
    {
      title: "Managing Urethral Strictures",
      url: "https://www.urologyhealth.org/urologic-conditions/urethral-stricture-disease",
      icon: <HelpCircle className="mr-2" size={16} />,
    },
  ]

  // Load custom resources from localStorage on component mount
  useEffect(() => {
    const savedResources = localStorage.getItem("customResources")
    if (savedResources) {
      try {
        setCustomResources(JSON.parse(savedResources))
      } catch (e) {
        console.error("Failed to parse saved resources", e)
      }
    }
  }, [])

  // Save custom resources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("customResources", JSON.stringify(customResources))
  }, [customResources])

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    // Validate inputs
    if (!newResourceTitle.trim()) {
      setFormError("Title is required")
      return
    }

    if (!newResourceUrl.trim()) {
      setFormError("URL is required")
      return
    }

    // Add http:// if missing
    let url = newResourceUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (e) {
      setFormError("Please enter a valid URL")
      return
    }

    if (!newResourceCategory.trim()) {
      setFormError("Category is required")
      return
    }

    // Add new resource
    const newResource: CustomResource = {
      id: Date.now().toString(),
      title: newResourceTitle.trim(),
      url: url,
      category: newResourceCategory.trim(),
    }

    setCustomResources([...customResources, newResource])

    // Reset form
    setNewResourceTitle("")
    setNewResourceUrl("")
    setNewResourceCategory("")
    setShowAddForm(false)
  }

  const handleDeleteResource = (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      setCustomResources(customResources.filter((resource) => resource.id !== id))
    }
  }

  // Group custom resources by category
  const groupedResources: Record<string, CustomResource[]> = {}
  customResources.forEach((resource) => {
    if (!groupedResources[resource.category]) {
      groupedResources[resource.category] = []
    }
    groupedResources[resource.category].push(resource)
  })

  return (
    <CollapsibleSection title="Helpful Resources" defaultExpanded={false}>
      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => setShowOfficialResources(!showOfficialResources)}
        >
          <h3 className="text-lg font-semibold">Official Resources</h3>
          {showOfficialResources ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {showOfficialResources && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {defaultResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {resource.icon}
                <span className="text-blue-600 dark:text-blue-400">{resource.title}</span>
                <ExternalLink className="ml-auto" size={14} />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 border-t pt-4">
        <div
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => setShowDietary(!showDietary)}
        >
          <h3 className="text-lg font-semibold flex items-center">
            <Utensils className="mr-2" size={20} />
            Dietary Recommendations
          </h3>
          {showDietary ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {showDietary && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">For Urethral Stricture</h4>

              <div className="mb-3">
                <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Foods to Include:</h5>
                <ul className="space-y-1 pl-5 list-disc">
                  <li>
                    <strong>Yogurt:</strong> Rich in probiotics, helps prevent urinary tract infections (UTIs) by
                    maintaining healthy gut flora.
                  </li>
                  <li>
                    <strong>Berries:</strong> Such as strawberries, blueberries, and cranberries are high in
                    antioxidants and vitamin C, which support urinary tract health.
                  </li>
                  <li>
                    <strong>Fiber-Rich Fruits:</strong> Apples (peeled), bananas, and oranges aid digestion and reduce
                    strain during urination.
                  </li>
                  <li>
                    <strong>Antioxidant-Rich Foods:</strong> Mangoes, grapes, apricots, eggplant, spinach, milk,
                    pumpkin, and carrots help reduce inflammation.
                  </li>
                  <li>
                    <strong>Garlic:</strong> Possesses antibacterial properties that can help prevent infections in the
                    urinary tract.
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">Foods to Avoid:</h5>
                <ul className="space-y-1 pl-5 list-disc">
                  <li>
                    <strong>Caffeinated Beverages:</strong> Such as coffee and energy drinks, which can irritate the
                    bladder.
                  </li>
                  <li>
                    <strong>Alcohol:</strong> Acts as a diuretic and bladder irritant, potentially worsening symptoms.
                  </li>
                  <li>
                    <strong>Red Meat:</strong> High consumption may increase inflammation.
                  </li>
                  <li>
                    <strong>Spicy Foods:</strong> Can irritate the urinary tract and exacerbate symptoms.
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">For BPH</h4>

              <div className="mb-3">
                <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Foods to Include:</h5>
                <ul className="space-y-1 pl-5 list-disc">
                  <li>
                    <strong>Fatty Fish:</strong> Salmon, sardines, and trout are rich in omega-3 fatty acids, which help
                    reduce inflammation.
                  </li>
                  <li>
                    <strong>Tomatoes:</strong> High in lycopene, an antioxidant beneficial for prostate health.
                  </li>
                  <li>
                    <strong>Berries:</strong> Strawberries, blueberries, and raspberries provide antioxidants that
                    protect the prostate.
                  </li>
                  <li>
                    <strong>Cruciferous Vegetables:</strong> Broccoli, cauliflower, and Brussels sprouts contain
                    compounds that may protect against prostate issues.
                  </li>
                  <li>
                    <strong>Citrus Fruits:</strong> Oranges, lemons, and grapefruits are high in vitamin C, supporting
                    overall prostate health.
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">Foods to Avoid:</h5>
                <ul className="space-y-1 pl-5 list-disc">
                  <li>
                    <strong>Red and Processed Meats:</strong> Linked to increased inflammation and may worsen BPH
                    symptoms.
                  </li>
                  <li>
                    <strong>Dairy Products:</strong> High-fat dairy may be associated with increased risk of prostate
                    issues.
                  </li>
                  <li>
                    <strong>Caffeine and Alcohol:</strong> Can irritate the bladder and increase urinary frequency.
                  </li>
                  <li>
                    <strong>Spicy Foods:</strong> May exacerbate urinary symptoms.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 border-t pt-4">
        <div
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => setShowExercise(!showExercise)}
        >
          <h3 className="text-lg font-semibold flex items-center">
            <Dumbbell className="mr-2" size={20} />
            Exercise Recommendations
          </h3>
          {showExercise ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {showExercise && (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">For Urethral Stricture</h4>
              <ul className="space-y-1 pl-5 list-disc">
                <li>
                  <strong>Pelvic Floor Exercises (Kegels):</strong> Strengthen the muscles supporting the bladder and
                  urethra, potentially improving urinary control.
                </li>
                <li>
                  <strong>Stretching Exercises:</strong> Hip flexor and butterfly stretches can enhance flexibility and
                  reduce pelvic tension.
                </li>
                <li>
                  <strong>Yoga:</strong> Certain poses may help alleviate symptoms by improving pelvic floor strength
                  and flexibility.
                </li>
              </ul>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">For BPH</h4>
              <ul className="space-y-1 pl-5 list-disc">
                <li>
                  <strong>Regular Physical Activity:</strong> Engaging in moderate to vigorous exercise for at least 5
                  hours per week can reduce BPH risk.
                </li>
                <li>
                  <strong>Walking:</strong> Adding an extra 3 hours of walking per week has been associated with a 10%
                  reduction in BPH risk.
                </li>
                <li>
                  <strong>Occupational Activity:</strong> Jobs involving physical labor may lower BPH risk compared to
                  sedentary work.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">My Resources</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center text-sm px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Plus size={16} className="mr-1" /> {showAddForm ? "Cancel" : "Add Resource"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddResource} className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="mb-3">
              <label htmlFor="resource-title" className="block text-sm font-medium mb-1 flex items-center">
                <FileText size={14} className="mr-1" /> Title
              </label>
              <input
                type="text"
                id="resource-title"
                value={newResourceTitle}
                onChange={(e) => setNewResourceTitle(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., My Doctor's Website"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="resource-url" className="block text-sm font-medium mb-1 flex items-center">
                <Link size={14} className="mr-1" /> URL
              </label>
              <input
                type="text"
                id="resource-url"
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., https://example.com"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="resource-category" className="block text-sm font-medium mb-1 flex items-center">
                <Tag size={14} className="mr-1" /> Category
              </label>
              <input
                type="text"
                id="resource-category"
                value={newResourceCategory}
                onChange={(e) => setNewResourceCategory(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Medical Providers"
              />
            </div>

            {formError && <div className="text-red-500 text-sm mb-3">{formError}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add
              </button>
            </div>
          </form>
        )}

        {Object.keys(groupedResources).length === 0 ? (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No custom resources added yet. Click "Add Resource" to add your own links.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedResources).map(([category, resources]) => (
              <div key={category} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300 border-b pb-1">{category}</h4>
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center flex-1 text-blue-600 dark:text-blue-400"
                      >
                        <span className="truncate">{resource.title}</span>
                        <ExternalLink className="ml-2 flex-shrink-0" size={14} />
                      </a>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="ml-2 text-red-500 hover:text-red-700 p-1"
                        aria-label="Delete resource"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Note: These resources are provided for informational purposes only and should not replace professional medical
        advice.
      </p>
    </CollapsibleSection>
  )
}

export default Resources
