'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlanningForm from '@/components/PlanningForm'
import ItineraryDisplay from '@/components/ItineraryDisplay'
import ApiKeyModal from '@/components/ApiKeyModal'
import { Itinerary } from '@/types/itinerary'
import { useAuth } from '@/contexts/AuthContext'
import { saveItinerary } from '@/lib/itineraryService'
import { generateAIItinerary } from '@/lib/aiItineraryGenerator'
import { getApiKey, initializeFromStorage, hasOpenAI } from '@/lib/openai'
import { Settings } from 'lucide-react'

export default function PlanPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Initialize OpenAI from localStorage on mount
    initializeFromStorage()
    setHasApiKey(!!getApiKey())
    
    // Also initialize Serper and HotelBeds
    const { initializeSerperFromStorage } = require('@/lib/serper')
    const { initializeHotelBedsFromStorage } = require('@/lib/hotelbeds')
    initializeSerperFromStorage()
    initializeHotelBedsFromStorage()
  }, [])

  const handleGenerateItinerary = async (formData: any) => {
    // Check if API key is set
    if (!hasOpenAI()) {
      setShowApiKeyModal(true)
      return
    }

    setIsGenerating(true)
    
    try {
      // Use AI to generate itinerary
      const aiItinerary = await generateAIItinerary(formData)
      setItinerary(aiItinerary)
    } catch (error: any) {
      console.error('Error generating itinerary:', error)
      alert(error.message || 'Failed to generate itinerary. Please try again.')
      
      // If API key error, show modal
      if (error.message?.includes('API key')) {
        setShowApiKeyModal(true)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApiKeySaved = () => {
    setHasApiKey(true)
  }

  const handleUpdateItinerary = (updatedItinerary: Itinerary) => {
    setItinerary(updatedItinerary)
  }

  const handleReset = () => {
    setItinerary(null)
    setSaveMessage('')
  }

  const handleSaveItinerary = async () => {
    if (!user) {
      router.push('/login?redirect=/plan')
      return
    }

    if (!itinerary) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      await saveItinerary(itinerary, user.uid)
      setSaveMessage('Itinerary saved successfully! View it in My Trips.')
      setTimeout(() => setSaveMessage(''), 5000)
    } catch (error) {
      console.error('Error saving itinerary:', error)
      setSaveMessage('Failed to save itinerary. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* API Key Settings Button */}
        <div className="max-w-4xl mx-auto mb-4 flex justify-end">
          <button
            onClick={() => setShowApiKeyModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              hasApiKey 
                ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            {hasApiKey ? 'API Key Configured' : 'Configure API Key'}
          </button>
        </div>

        {saveMessage && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className={`p-4 rounded-lg ${saveMessage.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {saveMessage}
            </div>
          </div>
        )}

          {!hasApiKey && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                <strong>⚡ AI-Powered Planning:</strong> Configure your API keys above to generate personalized itineraries with real data!
                <br />
                <span className="text-sm mt-2 block space-y-1">
                  <div>• <strong>OpenAI (Required):</strong> AI itinerary generation</div>
                  <div>• <strong>Serper (Optional):</strong> Real restaurants & attractions from Google</div>
                  <div>• <strong>HotelBeds (Optional):</strong> Real hotel availability & pricing</div>
                </span>
              </div>
            </div>
          )}

        {!itinerary ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Plan Your Perfect Trip</h1>
              <p className="text-xl text-gray-600">
                Tell us about your dream vacation and let AI create a personalized itinerary
              </p>
            </div>
            <PlanningForm onGenerate={handleGenerateItinerary} isGenerating={isGenerating} />
          </div>
        ) : (
          <ItineraryDisplay 
            itinerary={itinerary} 
            onUpdate={handleUpdateItinerary}
            onReset={handleReset}
            onSave={handleSaveItinerary}
            isSaving={isSaving}
            isLoggedIn={!!user}
          />
        )}
      </div>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySaved}
      />
    </div>
  )
}

// Mock itinerary generator
function generateMockItinerary(formData: any): Itinerary {
  const { destination, startDate, endDate, budget, travelers, preferences } = formData
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  const dailyPlans = []
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)
    
    dailyPlans.push({
      day: i + 1,
      date: currentDate.toISOString().split('T')[0],
      activities: generateDayActivities(destination, i, preferences),
      meals: generateMeals(destination, budget),
      accommodation: i === 0 ? generateAccommodation(destination, budget) : null,
      transportation: i === 0 ? generateTransportation(destination, budget) : null,
    })
  }
  
  const totalCost = calculateTotalCost(dailyPlans, budget)
  
  return {
    id: Date.now().toString(),
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    preferences,
    dailyPlans,
    totalCost,
    currency: 'USD',
    createdAt: new Date().toISOString(),
  }
}

function generateDayActivities(destination: string, dayIndex: number, preferences: string[]) {
  const activities = [
    {
      time: '09:00',
      title: dayIndex === 0 ? `Arrival at ${destination}` : 'Morning Exploration',
      description: dayIndex === 0 
        ? 'Check-in to hotel and freshen up' 
        : `Explore the historic district of ${destination}`,
      location: `${destination} City Center`,
      duration: '2 hours',
      cost: 0,
      type: 'arrival' as const,
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
    {
      time: '14:00',
      title: preferences.includes('cultural') ? 'Museum Visit' : 'Outdoor Adventure',
      description: preferences.includes('cultural')
        ? `Visit the renowned ${destination} Museum of Art`
        : `Hiking trail with stunning views of ${destination}`,
      location: preferences.includes('cultural') ? 'Museum District' : 'National Park',
      duration: '3 hours',
      cost: preferences.includes('cultural') ? 25 : 15,
      type: 'activity' as const,
      coordinates: { lat: 40.7614, lng: -73.9776 },
    },
    {
      time: '19:00',
      title: 'Evening Entertainment',
      description: preferences.includes('nightlife') 
        ? 'Experience the vibrant nightlife scene'
        : 'Sunset viewing and relaxation',
      location: 'Entertainment District',
      duration: '2 hours',
      cost: preferences.includes('nightlife') ? 50 : 0,
      type: 'activity' as const,
      coordinates: { lat: 40.7589, lng: -73.9851 },
    },
  ]
  
  return activities
}

function generateMeals(destination: string, budget: number) {
  const budgetMultiplier = budget > 3000 ? 1.5 : budget > 1500 ? 1 : 0.7
  
  return {
    breakfast: {
      restaurant: 'Local Café',
      cuisine: 'Continental',
      cost: Math.round(15 * budgetMultiplier),
      location: 'Hotel Area',
    },
    lunch: {
      restaurant: `${destination} Bistro`,
      cuisine: 'Local Cuisine',
      cost: Math.round(30 * budgetMultiplier),
      location: 'City Center',
    },
    dinner: {
      restaurant: 'Signature Restaurant',
      cuisine: 'Fine Dining',
      cost: Math.round(60 * budgetMultiplier),
      location: 'Waterfront District',
    },
  }
}

function generateAccommodation(destination: string, budget: number) {
  if (budget > 3000) {
    return {
      name: `${destination} Grand Hotel`,
      type: '5-Star Hotel',
      address: '123 Luxury Avenue',
      checkIn: '15:00',
      checkOut: '11:00',
      pricePerNight: 250,
      amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Concierge'],
      rating: 4.8,
    }
  } else if (budget > 1500) {
    return {
      name: `${destination} Boutique Inn`,
      type: '4-Star Hotel',
      address: '456 Central Street',
      checkIn: '15:00',
      checkOut: '11:00',
      pricePerNight: 150,
      amenities: ['WiFi', 'Breakfast', 'Gym', 'Restaurant'],
      rating: 4.5,
    }
  } else {
    return {
      name: `${destination} Budget Stay`,
      type: '3-Star Hotel',
      address: '789 Budget Road',
      checkIn: '14:00',
      checkOut: '10:00',
      pricePerNight: 80,
      amenities: ['WiFi', 'Breakfast'],
      rating: 4.2,
    }
  }
}

function generateTransportation(destination: string, budget: number) {
  return {
    outbound: {
      type: 'Flight',
      from: 'Home City',
      to: destination,
      departure: '08:00',
      arrival: '12:00',
      cost: budget > 2000 ? 450 : 280,
      airline: budget > 2000 ? 'Premium Airlines' : 'Budget Airlines',
      class: budget > 2000 ? 'Business' : 'Economy',
    },
    local: {
      type: 'Car Rental',
      provider: 'Local Car Rentals',
      costPerDay: budget > 2000 ? 60 : 35,
      pickupLocation: 'Airport',
    },
  }
}

function calculateTotalCost(dailyPlans: any[], budget: number) {
  let total = 0
  
  dailyPlans.forEach(day => {
    // Activities
    day.activities.forEach((activity: any) => {
      total += activity.cost
    })
    
    // Meals
    total += day.meals.breakfast.cost + day.meals.lunch.cost + day.meals.dinner.cost
    
    // Accommodation
    if (day.accommodation) {
      total += day.accommodation.pricePerNight * dailyPlans.length
    }
    
    // Transportation
    if (day.transportation) {
      total += day.transportation.outbound.cost
      total += day.transportation.local.costPerDay * dailyPlans.length
    }
  })
  
  return Math.round(total)
}

