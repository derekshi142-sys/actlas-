'use client'

import { useState, useEffect } from 'react'
import { Key, X, Eye, EyeOff, Check, Search, Hotel } from 'lucide-react'
import { saveApiKey, getApiKey, removeApiKey } from '@/lib/openai'
import { saveSerperKey, getStoredSerperKey, removeSerperKey } from '@/lib/serper'
import { saveHotelBedsCredentials, getStoredHotelBedsKey, getStoredHotelBedsSecret, removeHotelBedsCredentials } from '@/lib/hotelbeds'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [serperKey, setSerperKey] = useState('')
  const [hotelBedsKey, setHotelBedsKey] = useState('')
  const [hotelBedsSecret, setHotelBedsSecret] = useState('')
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showSerperKey, setShowSerperKey] = useState(false)
  const [showHotelBedsKey, setShowHotelBedsKey] = useState(false)
  const [showHotelBedsSecret, setShowHotelBedsSecret] = useState(false)
  const [hasExistingOpenAI, setHasExistingOpenAI] = useState(false)
  const [hasExistingSerper, setHasExistingSerper] = useState(false)
  const [hasExistingHotelBeds, setHasExistingHotelBeds] = useState(false)

  useEffect(() => {
    const existingOpenAI = getApiKey()
    const existingSerper = getStoredSerperKey()
    const existingHotelBedsKey = getStoredHotelBedsKey()
    const existingHotelBedsSecret = getStoredHotelBedsSecret()
    
    if (existingOpenAI) {
      setHasExistingOpenAI(true)
      setApiKey(existingOpenAI)
    }
    
    if (existingSerper) {
      setHasExistingSerper(true)
      setSerperKey(existingSerper)
    }

    if (existingHotelBedsKey && existingHotelBedsSecret) {
      setHasExistingHotelBeds(true)
      setHotelBedsKey(existingHotelBedsKey)
      setHotelBedsSecret(existingHotelBedsSecret)
    }
  }, [isOpen])

  const handleSave = async () => {
    let saved = false
    
    if (apiKey.trim()) {
      await saveApiKey(apiKey.trim())
      saved = true
    }
    
    if (serperKey.trim()) {
      await saveSerperKey(serperKey.trim())
      saved = true
    }

    if (hotelBedsKey.trim() && hotelBedsSecret.trim()) {
      await saveHotelBedsCredentials(hotelBedsKey.trim(), hotelBedsSecret.trim())
      saved = true
    }
    
    if (saved) {
      onSave()
      onClose()
    }
  }

  const handleRemoveOpenAI = async () => {
    await removeApiKey()
    setApiKey('')
    setHasExistingOpenAI(false)
  }

  const handleRemoveSerper = async () => {
    await removeSerperKey()
    setSerperKey('')
    setHasExistingSerper(false)
  }

  const handleRemoveHotelBeds = async () => {
    await removeHotelBedsCredentials()
    setHotelBedsKey('')
    setHotelBedsSecret('')
    setHasExistingHotelBeds(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold">API Keys Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Configure your API keys for AI-powered itinerary generation with real data. Your keys are securely stored in your account and synced across all your devices.
        </p>

        {/* OpenAI Section */}
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold">OpenAI API Key</h3>
            {hasExistingOpenAI && (
              <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Configured
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Required for AI itinerary generation (GPT-4o-mini)
          </p>

          <div className="mb-3">
            <div className="relative">
              <input
                type={showOpenAIKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOpenAIKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Get OpenAI API key →
            </a>
            {hasExistingOpenAI && (
              <button
                onClick={handleRemoveOpenAI}
                className="ml-auto text-xs text-red-600 hover:text-red-700 underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Serper Section */}
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold">Serper API Key</h3>
            {hasExistingSerper && (
              <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Configured
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">
            <strong>Optional but recommended:</strong> Provides accurate Google search data for real restaurants, hotels, and attractions
          </p>

          <div className="mb-3">
            <div className="relative">
              <input
                type={showSerperKey ? 'text' : 'password'}
                value={serperKey}
                onChange={(e) => setSerperKey(e.target.value)}
                placeholder="858a4fe88f3d688d2dc4a3471e7a4943654b284c"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowSerperKey(!showSerperKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSerperKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="https://serper.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Get Serper API key →
            </a>
            {hasExistingSerper && (
              <button
                onClick={handleRemoveSerper}
                className="ml-auto text-xs text-red-600 hover:text-red-700 underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
            💡 <strong>Why Serper?</strong> Gets real-time data from Google for actual restaurant names, hotels, and attractions in your destination!
          </div>
        </div>

        {/* HotelBeds Section */}
        <div className="mb-6 p-4 border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Hotel className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold">HotelBeds API</h3>
            {hasExistingHotelBeds && (
              <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Configured
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">
            <strong>Optional:</strong> Get real hotel availability, pricing, and room options directly from HotelBeds
          </p>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">API Key</label>
            <div className="relative">
              <input
                type={showHotelBedsKey ? 'text' : 'password'}
                value={hotelBedsKey}
                onChange={(e) => setHotelBedsKey(e.target.value)}
                placeholder="Your HotelBeds API Key"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowHotelBedsKey(!showHotelBedsKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showHotelBedsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">API Secret</label>
            <div className="relative">
              <input
                type={showHotelBedsSecret ? 'text' : 'password'}
                value={hotelBedsSecret}
                onChange={(e) => setHotelBedsSecret(e.target.value)}
                placeholder="Your HotelBeds API Secret"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowHotelBedsSecret(!showHotelBedsSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showHotelBedsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="https://www.hotelbeds.com/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Get HotelBeds API credentials →
            </a>
            {hasExistingHotelBeds && (
              <button
                onClick={handleRemoveHotelBeds}
                className="ml-auto text-xs text-red-600 hover:text-red-700 underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            🏨 <strong>Why HotelBeds?</strong> Get real-time hotel availability, accurate pricing, and actual room options for your itinerary!
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() && !serperKey.trim() && !hotelBedsKey.trim()}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Keys
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          🔒 Your API keys are encrypted and securely stored in your account
        </p>
      </div>
    </div>
  )
}

