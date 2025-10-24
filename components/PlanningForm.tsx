'use client'

import { useState } from 'react'
import { Calendar, DollarSign, Users, Sparkles } from 'lucide-react'

interface PlanningFormProps {
  onGenerate: (formData: any) => void
  isGenerating: boolean
}

export default function PlanningForm({ onGenerate, isGenerating }: PlanningFormProps) {
  const [destination, setDestination] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [travelers, setTravelers] = useState('2')
  const [preferences, setPreferences] = useState<string[]>([])
  const [travelStyle, setTravelStyle] = useState('balanced')
  const [pace, setPace] = useState('moderate')
  const [customRequests, setCustomRequests] = useState('')

  const preferenceOptions = [
    'Cultural',
    'Food',
    'Adventure',
    'Relaxation',
    'Nightlife',
    'Nature',
    'Shopping',
    'History',
  ]

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!destination || !startDate || !endDate || !budget) {
      alert('Please fill in all required fields')
      return
    }

    onGenerate({
      destination,
      homeCity,
      startDate,
      endDate,
      budget: parseInt(budget),
      travelers: parseInt(travelers),
      preferences,
      travelStyle,
      pace,
      customRequests,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home City */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Plane className="inline w-4 h-4" /> Home City/Airport *
          </label>
          <input
            type="text"
            value={homeCity}
            onChange={(e) => setHomeCity(e.target.value)}
            placeholder="e.g., New York JFK, Los Angeles"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            required
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Destination *
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, Tokyo, Bali"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4" /> Budget (USD) *
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., 3000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4" /> Start Date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4" /> End Date *
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            required
          />
        </div>

        {/* Travelers */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Users className="inline w-4 h-4" /> Number of Travelers
          </label>
          <input
            type="number"
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            min="1"
            max="20"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Travel Style */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Travel Style
          </label>
          <select
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          >
            <option value="luxury">Luxury</option>
            <option value="balanced">Balanced</option>
            <option value="budget">Budget</option>
          </select>
        </div>
      </div>

      {/* Trip Pace */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Pace</label>
        <div className="grid grid-cols-3 gap-3">
          {['relaxed', 'moderate', 'fast'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPace(p)}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                pace === p
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Travel Preferences (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {preferenceOptions.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => togglePreference(pref)}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                preferences.includes(pref)
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Requests */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Custom Requests (Optional)
        </label>
        <textarea
          value={customRequests}
          onChange={(e) => setCustomRequests(e.target.value)}
          placeholder="Any special requests or preferences? E.g., 'Must visit the Eiffel Tower', 'Vegetarian dining options', 'Kid-friendly activities'..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Generating Your Perfect Itinerary...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate AI Itinerary
          </>
        )}
      </button>

      {isGenerating && (
        <p className="text-center text-sm text-gray-600">
          This may take 15-30 seconds. We're fetching real data from Google and creating your personalized itinerary...
        </p>
      )}
    </form>
  )
}

