// Serper API integration for Google search data
import { saveApiKeysToFirestore, removeApiKeyFromFirestore } from './apiKeysService'

let serperApiKey: string | null = null
let currentUserId: string | null = null

export function initializeSerper(apiKey: string) {
  serperApiKey = apiKey
}

export function getSerperKey(): string | null {
  return serperApiKey
}

export function hasSerper(): boolean {
  return serperApiKey !== null
}

// Set current user ID for Firestore sync
export function setSerperUserId(userId: string | null) {
  currentUserId = userId
}

// Store Serper key in localStorage and Firestore
export async function saveSerperKey(apiKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('serper_api_key', apiKey)
    initializeSerper(apiKey)
    
    // Sync to Firestore if user is logged in
    if (currentUserId) {
      try {
        await saveApiKeysToFirestore(currentUserId, { serper: apiKey })
      } catch (error) {
        console.error('Failed to sync Serper key to Firestore:', error)
      }
    }
  }
}

// Get Serper key from localStorage
export function getStoredSerperKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('serper_api_key')
  }
  return null
}

// Remove Serper key from localStorage and Firestore
export async function removeSerperKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('serper_api_key')
    serperApiKey = null
    
    // Remove from Firestore if user is logged in
    if (currentUserId) {
      try {
        await removeApiKeyFromFirestore(currentUserId, 'serper')
      } catch (error) {
        console.error('Failed to remove Serper key from Firestore:', error)
      }
    }
  }
}

// Initialize on load if key exists
export function initializeSerperFromStorage() {
  const apiKey = getStoredSerperKey()
  if (apiKey) {
    initializeSerper(apiKey)
  }
}

// Load API key from Firestore and update localStorage
export function loadSerperKeyFromFirestore(apiKey: string | undefined) {
  if (apiKey && typeof window !== 'undefined') {
    localStorage.setItem('serper_api_key', apiKey)
    initializeSerper(apiKey)
  }
}

interface SerperSearchParams {
  query: string
  num?: number
  location?: string
}

interface SerperResult {
  title: string
  link: string
  snippet: string
  rating?: number
  price?: string
  type?: string
}

// Search for places using Serper API
export async function searchPlaces(params: SerperSearchParams): Promise<SerperResult[]> {
  const apiKey = getSerperKey()
  
  if (!apiKey) {
    throw new Error('Serper API key not configured')
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: params.query,
        num: params.num || 10,
        gl: params.location || 'us',
      }),
    })

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Extract organic results
    const results = data.organic || []
    
    return results.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      rating: result.rating,
      price: result.price,
      type: result.type,
    }))
  } catch (error) {
    console.error('Serper API error:', error)
    throw error
  }
}

// Get restaurants for a destination
export async function getRestaurants(destination: string, cuisine?: string): Promise<SerperResult[]> {
  const query = cuisine 
    ? `best ${cuisine} restaurants in ${destination}`
    : `best restaurants in ${destination}`
  
  return searchPlaces({ query, num: 20 })
}

// Get hotels for a destination
export async function getHotels(destination: string, budget: string): Promise<SerperResult[]> {
  const query = `${budget} hotels in ${destination} with good reviews`
  return searchPlaces({ query, num: 10 })
}

// Get attractions for a destination
export async function getAttractions(destination: string, type?: string): Promise<SerperResult[]> {
  const query = type
    ? `best ${type} attractions in ${destination}`
    : `top tourist attractions in ${destination}`
  
  return searchPlaces({ query, num: 20 })
}

// Get comprehensive destination data
export async function getDestinationData(
  destination: string,
  budget: number,
  preferences: string[]
) {
  try {
    const budgetLevel = budget > 3000 ? 'luxury' : budget > 1500 ? 'mid-range' : 'budget'
    
    // Search in parallel for better performance
    const [restaurants, hotels, attractions] = await Promise.all([
      getRestaurants(destination).catch(() => []),
      getHotels(destination, budgetLevel).catch(() => []),
      getAttractions(destination).catch(() => []),
    ])

    // Get specific preference-based attractions
    const preferenceAttractions = await Promise.all(
      preferences.slice(0, 3).map(pref => 
        getAttractions(destination, pref).catch(() => [])
      )
    ).then(results => results.flat())

    return {
      restaurants,
      hotels,
      attractions: [...attractions, ...preferenceAttractions],
    }
  } catch (error) {
    console.error('Error fetching destination data:', error)
    return {
      restaurants: [],
      hotels: [],
      attractions: [],
    }
  }
}




