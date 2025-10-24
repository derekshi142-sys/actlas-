// HotelBeds API integration for real hotel search and booking

interface HotelBedsConfig {
  apiKey: string
  apiSecret: string
  baseUrl: string
}

let hotelBedsConfig: HotelBedsConfig | null = null

// Initialize HotelBeds API
export function initializeHotelBeds(apiKey: string, apiSecret: string) {
  hotelBedsConfig = {
    apiKey,
    apiSecret,
    baseUrl: 'https://api.test.hotelbeds.com', // Use test environment
  }
}

export function hasHotelBeds(): boolean {
  return hotelBedsConfig !== null
}

export function getHotelBedsConfig(): HotelBedsConfig | null {
  return hotelBedsConfig
}

// Store HotelBeds credentials in localStorage
export function saveHotelBedsCredentials(apiKey: string, apiSecret: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hotelbeds_api_key', apiKey)
    localStorage.setItem('hotelbeds_api_secret', apiSecret)
    initializeHotelBeds(apiKey, apiSecret)
  }
}

// Get stored credentials
export function getStoredHotelBedsKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hotelbeds_api_key')
  }
  return null
}

export function getStoredHotelBedsSecret(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hotelbeds_api_secret')
  }
  return null
}

// Remove credentials
export function removeHotelBedsCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hotelbeds_api_key')
    localStorage.removeItem('hotelbeds_api_secret')
    hotelBedsConfig = null
  }
}

// Initialize from storage on load
export function initializeHotelBedsFromStorage() {
  const apiKey = getStoredHotelBedsKey()
  const apiSecret = getStoredHotelBedsSecret()
  if (apiKey && apiSecret) {
    initializeHotelBeds(apiKey, apiSecret)
  }
}

// Helper to get common headers for API requests
function getApiHeaders(): HeadersInit {
  if (!hotelBedsConfig) {
    throw new Error('HotelBeds not configured')
  }
  
  return {
    'Content-Type': 'application/json',
    'x-hotelbeds-key': hotelBedsConfig.apiKey,
    'x-hotelbeds-secret': hotelBedsConfig.apiSecret,
  }
}

// Types
export interface HotelSearchParams {
  destination: string // City name or destination code
  checkIn: string // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
  adults: number
  children?: number
  rooms?: number
}

export interface HotelAvailability {
  code: string
  name: string
  categoryCode: string
  categoryName: string
  latitude: string
  longitude: string
  address?: string
  city?: string
  rooms: Array<{
    code: string
    name: string
    rates: Array<{
      rateKey: string
      rateClass: string
      rateType: string
      net: number
      sellingRate: number
      boardCode: string
      boardName: string
      cancellationPolicies?: Array<{
        amount: number
        from: string
      }>
    }>
  }>
  minRate: number
  maxRate: number
  currency: string
  images?: string[]
  description?: string
}

// Check HotelBeds API status
export async function checkApiStatus(): Promise<boolean> {
  if (!hotelBedsConfig) {
    return false
  }

  try {
    const response = await fetch('/api/hotelbeds/status', {
      method: 'GET',
      headers: getApiHeaders(),
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.ok
  } catch (error) {
    console.error('HotelBeds API status check failed:', error)
    return false
  }
}

// Check availability for hotels
export async function checkAvailability(params: HotelSearchParams): Promise<HotelAvailability[]> {
  if (!hotelBedsConfig) {
    throw new Error('HotelBeds API not configured')
  }

  try {
    const requestBody = {
      stay: {
        checkIn: params.checkIn,
        checkOut: params.checkOut,
      },
      occupancies: [
        {
          rooms: params.rooms || 1,
          adults: params.adults,
          children: params.children || 0,
        },
      ],
      destination: {
        code: params.destination,
      },
    }

    console.log('🔍 Checking hotel availability:', requestBody)

    const response = await fetch('/api/hotelbeds/availability', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('HotelBeds availability error:', response.status, errorData)
      throw new Error(`HotelBeds API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.hotels || !data.hotels.hotels) {
      console.warn('No hotels found in response')
      return []
    }

    // Parse and format the hotels
    const hotels = data.hotels.hotels.map((hotel: any) => {
      const rooms = hotel.rooms || []
      const allRates = rooms.flatMap((room: any) => room.rates || [])
      const minRate = allRates.length > 0 ? Math.min(...allRates.map((r: any) => r.net)) : 0
      const maxRate = allRates.length > 0 ? Math.max(...allRates.map((r: any) => r.net)) : 0

      return {
        code: hotel.code,
        name: hotel.name,
        categoryCode: hotel.categoryCode,
        categoryName: hotel.categoryName,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        address: hotel.address,
        city: hotel.city,
        rooms: rooms.map((room: any) => ({
          code: room.code,
          name: room.name,
          rates: (room.rates || []).map((rate: any) => ({
            rateKey: rate.rateKey,
            rateClass: rate.rateClass,
            rateType: rate.rateType,
            net: rate.net,
            sellingRate: rate.sellingRate,
            boardCode: rate.boardCode,
            boardName: rate.boardName,
            cancellationPolicies: rate.cancellationPolicies,
          })),
        })),
        minRate,
        maxRate,
        currency: data.hotels.currency || 'USD',
        images: hotel.images?.map((img: any) => img.path) || [],
        description: hotel.description?.content || '',
      } as HotelAvailability
    })

    console.log(`✅ Found ${hotels.length} available hotels`)
    return hotels
  } catch (error) {
    console.error('HotelBeds availability check error:', error)
    throw error
  }
}

// Check rates for specific hotels
export async function checkRates(rateKeys: string[]): Promise<any[]> {
  if (!hotelBedsConfig) {
    throw new Error('HotelBeds API not configured')
  }

  try {
    const requestBody = {
      rooms: rateKeys.map(rateKey => ({ rateKey })),
    }

    console.log('💰 Checking rates for:', rateKeys.length, 'options')

    const response = await fetch('/api/hotelbeds/checkrates', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('HotelBeds checkrates error:', response.status, errorData)
      throw new Error(`HotelBeds API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('✅ Rate check complete')
    return data.hotel?.rooms || []
  } catch (error) {
    console.error('HotelBeds rate check error:', error)
    throw error
  }
}

// Search for hotels (backward compatibility - uses checkAvailability)
export async function searchHotels(params: HotelSearchParams): Promise<HotelAvailability[]> {
  return checkAvailability(params)
}

// Get destination codes (helper function to map city names to codes)
export async function getDestinationCode(cityName: string): Promise<string | null> {
  if (!hotelBedsConfig) {
    return null
  }

  // First, try fallback codes since they're fast and reliable
  const fallbackCode = getDestinationCodeFallback(cityName)
  if (fallbackCode) {
    console.log(`Using fallback destination code for ${cityName}: ${fallbackCode}`)
    return fallbackCode
  }

  // If no fallback, try API
  try {
    const response = await fetch('/api/hotelbeds/destinations', {
      method: 'GET',
      headers: getApiHeaders(),
    })

    if (!response.ok) {
      console.warn('Failed to fetch destination codes from API')
      return null
    }

    const data = await response.json()
    
    if (!data.destinations || !Array.isArray(data.destinations)) {
      console.warn('Invalid destinations response format')
      return null
    }
    
    // Find destination by city name
    const destination = data.destinations.find((dest: any) => {
      try {
        // Check if dest.name exists and is a string
        if (dest && dest.name && typeof dest.name === 'string') {
          return dest.name.toLowerCase().includes(cityName.toLowerCase())
        }
        // Also check content field which might contain the name
        if (dest && dest.content && typeof dest.content === 'string') {
          return dest.content.toLowerCase().includes(cityName.toLowerCase())
        }
      } catch (err) {
        // Silently skip malformed entries
        return false
      }
      return false
    })
    
    if (destination?.code) {
      console.log(`Found destination code via API for ${cityName}: ${destination.code}`)
      return destination.code
    }
    
    return null
  } catch (error) {
    console.error('HotelBeds destination code API error:', error)
    return null
  }
}

// Fallback destination code mapping for common cities
function getDestinationCodeFallback(cityName: string): string | null {
  const cityLower = cityName.toLowerCase()
  
  // Common destination codes
  const commonCodes: { [key: string]: string } = {
    'paris': 'PAR',
    'london': 'LON',
    'new york': 'NYC',
    'tokyo': 'TYO',
    'barcelona': 'BCN',
    'rome': 'ROM',
    'amsterdam': 'AMS',
    'dubai': 'DXB',
    'madrid': 'MAD',
    'berlin': 'BER',
    'los angeles': 'LAX',
    'san francisco': 'SFO',
    'miami': 'MIA',
    'las vegas': 'LAS',
    'chicago': 'CHI',
    'boston': 'BOS',
    'seattle': 'SEA',
    'sydney': 'SYD',
    'melbourne': 'MEL',
    'singapore': 'SIN',
    'hong kong': 'HKG',
    'bangkok': 'BKK',
    'istanbul': 'IST',
    'lisbon': 'LIS',
    'prague': 'PRG',
    'vienna': 'VIE',
    'athens': 'ATH',
    'venice': 'VCE',
    'florence': 'FLR',
    'milan': 'MIL',
    'munich': 'MUC',
    'dublin': 'DUB',
    'edinburgh': 'EDI',
    'copenhagen': 'CPH',
    'stockholm': 'STO',
    'oslo': 'OSL',
    'reykjavik': 'REK',
    'cairo': 'CAI',
    'marrakech': 'RAK',
    'cancun': 'CUN',
    'mexico city': 'MEX',
    'rio de janeiro': 'RIO',
    'buenos aires': 'BUE',
    'toronto': 'YTO',
    'vancouver': 'YVR',
    'montreal': 'YMQ',
  }
  
  // Check for exact match
  if (commonCodes[cityLower]) {
    console.log(`Using fallback destination code for ${cityName}: ${commonCodes[cityLower]}`)
    return commonCodes[cityLower]
  }
  
  // Check for partial match
  for (const [city, code] of Object.entries(commonCodes)) {
    if (cityLower.includes(city) || city.includes(cityLower)) {
      console.log(`Using fallback destination code for ${cityName}: ${code}`)
      return code
    }
  }
  
  console.warn(`No destination code found for: ${cityName}`)
  return null
}

