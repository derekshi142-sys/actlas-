import OpenAI from 'openai'
import { saveApiKeysToFirestore, removeApiKeyFromFirestore } from './apiKeysService'

let openaiInstance: OpenAI | null = null
let currentUserId: string | null = null

export function initializeOpenAI(apiKey: string) {
  openaiInstance = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Allow browser usage
  })
  return openaiInstance
}

export function getOpenAI(): OpenAI | null {
  return openaiInstance
}

export function hasOpenAI(): boolean {
  return openaiInstance !== null
}

// Set current user ID for Firestore sync
export function setOpenAIUserId(userId: string | null) {
  currentUserId = userId
}

// Store API key in localStorage and Firestore
export async function saveApiKey(apiKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', apiKey)
    initializeOpenAI(apiKey)
    
    // Sync to Firestore if user is logged in
    if (currentUserId) {
      try {
        await saveApiKeysToFirestore(currentUserId, { openai: apiKey })
      } catch (error) {
        console.error('Failed to sync OpenAI key to Firestore:', error)
      }
    }
  }
}

// Get API key from localStorage
export function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_api_key')
  }
  return null
}

// Remove API key from localStorage and Firestore
export async function removeApiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('openai_api_key')
    openaiInstance = null
    
    // Remove from Firestore if user is logged in
    if (currentUserId) {
      try {
        await removeApiKeyFromFirestore(currentUserId, 'openai')
      } catch (error) {
        console.error('Failed to remove OpenAI key from Firestore:', error)
      }
    }
  }
}

// Initialize on load if key exists
export function initializeFromStorage() {
  const apiKey = getApiKey()
  if (apiKey) {
    initializeOpenAI(apiKey)
  }
}

// Load API key from Firestore and update localStorage
export function loadApiKeyFromFirestore(apiKey: string | undefined) {
  if (apiKey && typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', apiKey)
    initializeOpenAI(apiKey)
  }
}




