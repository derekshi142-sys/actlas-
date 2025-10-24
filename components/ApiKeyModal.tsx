'use client'

import { useState, useEffect } from 'react'
import { Key, X, Eye, EyeOff, Check, Search } from 'lucide-react'
import { saveApiKey, getApiKey, removeApiKey } from '@/lib/openai'
import { saveSerperKey, getStoredSerperKey, removeSerperKey } from '@/lib/serper'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [serperKey, setSerperKey] = useState('')
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showSerperKey, setShowSerperKey] = useState(false)
  const [hasExistingOpenAI, setHasExistingOpenAI] = useState(false)
  const [hasExistingSerper, setHasExistingSerper] = useState(false)

  useEffect(() => {
    const existingOpenAI = getApiKey()
    const existingSerper = getStoredSerperKey()
    
    if (existingOpenAI) {
      setHasExistingOpenAI(true)
      setApiKey(existingOpenAI)
    }
    
    if (existingSerper) {
      setHasExistingSerper(true)
      setSerperKey(existingSerper)
    }
  }, [isOpen])

  const handleSave = () => {
    let saved = false
    
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim())
      saved = true
    }
    
    if (serperKey.trim()) {
      saveSerperKey(serperKey.trim())
      saved = true
    }
    
    if (saved) {
      onSave()
      onClose()
    }
  }

  const handleRemoveOpenAI = () => {
    removeApiKey()
    setApiKey('')
    setHasExistingOpenAI(false)
  }

  const handleRemoveSerper = () => {
    removeSerperKey()
    setSerperKey('')
    setHasExistingSerper(false)
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
          Configure your API keys for AI-powered itinerary generation with real data from Google. Your keys are stored locally and never sent to our servers.
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

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() && !serperKey.trim()}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Keys
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          🔒 Your API keys are stored securely in your browser only
        </p>
      </div>
    </div>
  )
}

