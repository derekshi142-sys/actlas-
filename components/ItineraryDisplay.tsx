'use client'

import { useState } from 'react'
import { Itinerary } from '@/types/itinerary'
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Utensils,
  Hotel,
  Plane,
  Download,
  Save,
  RefreshCw,
  TrendingDown,
} from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'

interface ItineraryDisplayProps {
  itinerary: Itinerary
  onUpdate: (itinerary: Itinerary) => void
  onReset: () => void
  onSave?: () => void
  isSaving?: boolean
  isLoggedIn?: boolean
}

export default function ItineraryDisplay({
  itinerary,
  onReset,
  onSave,
  isSaving,
  isLoggedIn,
}: ItineraryDisplayProps) {
  const [activeDay, setActiveDay] = useState(1)

  const currentDay = itinerary.dailyPlans.find((d) => d.day === activeDay)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: itinerary.currency || 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const savings = itinerary.budget - itinerary.totalCost
  const savingsPercentage = ((savings / itinerary.budget) * 100).toFixed(0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Savings Banner */}
      {savings > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingDown className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm opacity-90 font-medium">Amount Saved</div>
                <div className="text-4xl font-bold">
                  <AnimatedCounter value={savings} duration={2500} />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold opacity-20">{savingsPercentage}%</div>
              <div className="text-sm opacity-90">Under Budget!</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{itinerary.destination}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {itinerary.travelers} {itinerary.travelers === 1 ? 'Traveler' : 'Travelers'}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Budget: {formatCurrency(itinerary.budget)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Total Cost</div>
            <div className="text-3xl font-bold">{formatCurrency(itinerary.totalCost)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Trip
          </button>
          {isLoggedIn && onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Trip'}
            </button>
          )}
          <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {itinerary.dailyPlans.map((day) => (
            <button
              key={day.day}
              onClick={() => setActiveDay(day.day)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeDay === day.day
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Content */}
      {currentDay && (
        <div className="space-y-6">
          {/* Activities */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary-600" />
              Activities
            </h2>
            <div className="space-y-4">
              {currentDay.activities.map((activity, idx) => (
                <div key={idx} className="border-l-4 border-primary-600 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        {activity.time} • {activity.duration}
                      </div>
                      <h3 className="text-lg font-semibold">{activity.title}</h3>
                    </div>
                    <div className="text-lg font-bold text-primary-600">
                      {formatCurrency(activity.cost)}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-1">{activity.description}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meals */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary-600" />
              Meals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                const meal = currentDay.meals[mealType as keyof typeof currentDay.meals]
                return (
                  <div key={mealType} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-500 uppercase mb-2">
                      {mealType}
                    </div>
                    <h3 className="font-semibold mb-1">{meal.restaurant}</h3>
                    <div className="text-sm text-gray-600 mb-2">{meal.cuisine}</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">{meal.location}</div>
                      <div className="font-bold text-primary-600">
                        {formatCurrency(meal.cost)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Accommodation (Day 1 only) */}
          {currentDay.accommodation && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Hotel className="w-6 h-6 text-primary-600" />
                Accommodation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentDay.accommodation.name}
                  </h3>
                  <div className="text-gray-600 mb-2">{currentDay.accommodation.type}</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {currentDay.accommodation.address}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div>Check-in: {currentDay.accommodation.checkIn}</div>
                    <div>Check-out: {currentDay.accommodation.checkOut}</div>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600 mb-2">
                    {formatCurrency(currentDay.accommodation.pricePerNight)}/night
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Rating: {currentDay.accommodation.rating}/5 ⭐
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentDay.accommodation.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transportation (Day 1 only) */}
          {currentDay.transportation && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Plane className="w-6 h-6 text-primary-600" />
                Transportation
              </h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Flight</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">From: {currentDay.transportation.outbound.from}</div>
                      <div className="text-sm text-gray-600">To: {currentDay.transportation.outbound.to}</div>
                      <div className="text-sm text-gray-600">
                        Departure: {currentDay.transportation.outbound.departure}
                      </div>
                      <div className="text-sm text-gray-600">
                        Arrival: {currentDay.transportation.outbound.arrival}
                      </div>
                    </div>
                    <div className="text-right md:text-left">
                      <div className="text-sm text-gray-600 mb-1">
                        {currentDay.transportation.outbound.airline} • {currentDay.transportation.outbound.class}
                      </div>
                      <div className="text-xl font-bold text-primary-600">
                        {formatCurrency(currentDay.transportation.outbound.cost)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Local Transportation</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">
                        {currentDay.transportation.local.type} - {currentDay.transportation.local.provider}
                      </div>
                      <div className="text-sm text-gray-600">
                        Pickup: {currentDay.transportation.local.pickupLocation}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary-600">
                      {formatCurrency(currentDay.transportation.local.costPerDay)}/day
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

