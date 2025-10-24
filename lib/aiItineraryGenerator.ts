import { getOpenAI } from './openai'
import { getDestinationData, hasSerper, initializeSerperFromStorage } from './serper'
import { checkAvailability, checkRates, hasHotelBeds, initializeHotelBedsFromStorage, getDestinationCode } from './hotelbeds'
import { Itinerary } from '@/types/itinerary'

interface TripPreferences {
  destination: string
  homeCity: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  preferences: string[]
  travelStyle: string
  pace: string
  customRequests?: string
}

export async function generateAIItinerary(preferences: TripPreferences): Promise<Itinerary> {
  const openai = getOpenAI()
  
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please add your API key in settings.')
  }

  // Initialize Serper and HotelBeds from storage if available
  initializeSerperFromStorage()
  initializeHotelBedsFromStorage()

  const days = Math.ceil(
    (new Date(preferences.endDate).getTime() - new Date(preferences.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  ) + 1

  // Fetch real data from Serper and HotelBeds in parallel
  const [realPlacesData, hotelBedsData] = await Promise.all([
    // Serper: Get general place recommendations
    hasSerper() 
      ? (async () => {
          try {
            console.log('🔍 Fetching real places from Google via Serper...')
            const data = await getDestinationData(preferences.destination, preferences.budget, preferences.preferences)
            console.log('✅ Got Serper data:', {
              restaurants: data.restaurants.length,
              hotels: data.hotels.length,
              attractions: data.attractions.length,
            })
            return data
          } catch (error) {
            console.warn('⚠️ Serper API failed, continuing without real data:', error)
            return null
          }
        })()
      : Promise.resolve(null),
    
    // HotelBeds: Get real hotel availability and pricing
    hasHotelBeds()
      ? (async () => {
          try {
            console.log('🏨 Fetching real hotel availability from HotelBeds...')
            // Get destination code for the city
            const destCode = await getDestinationCode(preferences.destination)
            if (!destCode) {
              console.warn('⚠️ Could not find destination code for', preferences.destination)
              return null
            }
            
            const hotels = await checkAvailability({
              destination: destCode,
              checkIn: preferences.startDate,
              checkOut: preferences.endDate,
              adults: preferences.travelers,
              rooms: 1,
            })
            
            console.log('✅ Got HotelBeds data:', hotels.length, 'hotels with real availability')
            return hotels
          } catch (error) {
            console.warn('⚠️ HotelBeds API failed:', error)
            return null
          }
        })()
      : Promise.resolve(null),
  ])

  // Build prompt with optional real data from Serper and HotelBeds
  let realDataContext = ''
  
  if (realPlacesData) {
    realDataContext += `

🔍 REAL GOOGLE DATA - USE THESE ACTUAL PLACES:

RESTAURANTS (${realPlacesData.restaurants.length} verified):
${realPlacesData.restaurants.slice(0, 15).map((r, i) => 
  `${i + 1}. ${r.title}\n   ${r.snippet}`
).join('\n')}

HOTELS (${realPlacesData.hotels.length} verified):
${realPlacesData.hotels.slice(0, 8).map((h, i) => 
  `${i + 1}. ${h.title}\n   ${h.snippet}`
).join('\n')}

ATTRACTIONS (${realPlacesData.attractions.length} verified):
${realPlacesData.attractions.slice(0, 15).map((a, i) => 
  `${i + 1}. ${a.title}\n   ${a.snippet}`
).join('\n')}

⚠️ IMPORTANT: Use ONLY the places listed above. Extract exact names from the titles.
`
  }

  if (hotelBedsData && hotelBedsData.length > 0) {
    realDataContext += `

🏨 REAL HOTELBEDS DATA - ACTUAL HOTELS WITH AVAILABILITY & PRICING:

${hotelBedsData.slice(0, 10).map((hotel, i) => 
  `${i + 1}. ${hotel.name}
   Category: ${hotel.categoryName}
   Price: $${Math.round(hotel.minRate)} - $${Math.round(hotel.maxRate)} per night
   Address: ${hotel.address || hotel.city}
   ${hotel.description ? 'Info: ' + hotel.description.substring(0, 150) : ''}`
).join('\n\n')}

⚠️ IMPORTANT: Use these REAL hotels with ACTUAL pricing for accommodation recommendations!
`
  }

  const budgetPerDay = preferences.budget / days
  const isHighBudget = budgetPerDay > 500
  const isMediumBudget = budgetPerDay >= 200 && budgetPerDay <= 500
  const isLowBudget = budgetPerDay < 200

  const prompt = `Create a detailed ${days}-day vacation itinerary for ${preferences.destination}.

Trip Details:
- Home City/Airport: ${preferences.homeCity}
- Destination: ${preferences.destination}
- Dates: ${preferences.startDate} to ${preferences.endDate}
- Budget: $${preferences.budget} USD
- Travelers: ${preferences.travelers} people
- Interests: ${preferences.preferences.join(', ')}
- Travel Style: ${preferences.travelStyle}
- Trip Pace: ${preferences.pace}
${preferences.customRequests ? `- Custom Requests: ${preferences.customRequests}` : ''}
${realDataContext}

🔥 CRITICAL BUDGET REQUIREMENTS:
- You MUST use at least 80% of the budget ($${Math.floor(preferences.budget * 0.8)}) to ensure a full, quality experience
- Target total cost: $${Math.floor(preferences.budget * 0.85)} to $${Math.floor(preferences.budget * 0.95)}
${isHighBudget ? `
- HIGH BUDGET DETECTED: Use luxury/premium options:
  * Business or First Class flights
  * 5-star hotels with premium amenities
  * Private transportation or premium car rentals
  * Fine dining restaurants ($$$$)
  * Premium activities and exclusive experiences
  * VIP tours and skip-the-line access
` : isMediumBudget ? `
- MEDIUM BUDGET: Use comfortable mid-range options:
  * Economy Plus or Premium Economy flights
  * 4-star hotels with good amenities
  * Standard car rentals or rideshare services
  * Mix of casual and upscale dining ($$ - $$$)
  * Popular activities and guided tours
` : `
- BUDGET CONSCIOUS: Maximize value:
  * Economy class flights
  * 3-star hotels or quality hostels
  * Public transportation or budget car rentals
  * Local restaurants and street food ($ - $$)
  * Free or low-cost activities
  * Self-guided tours
`}

For each day, provide:
1. 3-4 activities with specific times, locations, descriptions, and estimated costs${realPlacesData ? ' - USE REAL ATTRACTIONS FROM THE LIST ABOVE' : ''}
2. Restaurant recommendations for breakfast, lunch, and dinner with cuisine types and costs${realPlacesData ? ' - USE REAL RESTAURANTS FROM THE LIST ABOVE' : ''}
3. For day 1 only: accommodation details (hotel name, type, amenities, price per night)${realPlacesData ? ' - USE REAL HOTELS FROM THE LIST ABOVE' : ''} and transportation (flight details, local transport)

Format the response as a JSON object with this structure:
{
  "dailyPlans": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity Name",
          "description": "Detailed description",
          "location": "Specific location",
          "duration": "2 hours",
          "cost": 25,
          "type": "activity"
        }
      ],
      "meals": {
        "breakfast": {"restaurant": "Name", "cuisine": "Type", "cost": 15, "location": "Area"},
        "lunch": {"restaurant": "Name", "cuisine": "Type", "cost": 25, "location": "Area"},
        "dinner": {"restaurant": "Name", "cuisine": "Type", "cost": 45, "location": "Area"}
      },
      "accommodation": {
        "name": "Hotel Name",
        "type": "4-Star Hotel",
        "address": "Full address",
        "checkIn": "15:00",
        "checkOut": "11:00",
        "pricePerNight": 150,
        "amenities": ["WiFi", "Pool", "Gym"],
        "rating": 4.5
      },
      "transportation": {
        "outbound": {
          "type": "Flight",
          "from": "${preferences.homeCity}",
          "to": "${preferences.destination}",
          "departure": "08:00",
          "arrival": "12:00",
          "cost": 450,
          "airline": "Airline Name",
          "class": "Economy"
        },
        "local": {
          "type": "Car Rental",
          "provider": "Provider Name",
          "costPerDay": 50,
          "pickupLocation": "Airport"
        }
      }
    }
  ]
}

IMPORTANT PRICING GUIDELINES:
- Total cost should be 80-95% of the budget
- Scale all prices (flights, hotels, meals, activities) according to the budget level
- Don't be too conservative - use most of the budget to create an amazing experience
- If high budget, splurge on luxury options
- If medium budget, choose solid mid-range options
- If low budget, find best value options

Make it realistic, locally accurate, and USE THE BUDGET FULLY. Only include accommodation and transportation for day 1.${realPlacesData ? '\n\n🎯 CRITICAL: Only use the REAL places provided in the Google data section above. Do not invent or fabricate places.' : ''}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert travel planner${realPlacesData ? ' with access to real Google search data' : ''}. Generate detailed, realistic, and personalized vacation itineraries${realPlacesData ? ' using ACTUAL places from Google. You have been provided with real restaurants, hotels, and attractions - USE ONLY THESE REAL PLACES in your itinerary' : ''}. CRITICAL: Respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Start directly with { and end with }.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from AI')
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim()
    
    // Remove ```json and ``` markers if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '')
    }
    
    cleanedResponse = cleanedResponse.trim()

    // Parse the JSON response
    const aiData = JSON.parse(cleanedResponse)
    
    // Calculate total cost
    let totalCost = 0
    aiData.dailyPlans.forEach((day: any) => {
      day.activities.forEach((act: any) => {
        totalCost += act.cost || 0
      })
      totalCost += day.meals.breakfast.cost + day.meals.lunch.cost + day.meals.dinner.cost
      if (day.accommodation) {
        totalCost += day.accommodation.pricePerNight * days
      }
      if (day.transportation) {
        totalCost += day.transportation.outbound.cost
        totalCost += day.transportation.local.costPerDay * days
      }
    })

    // Add coordinates (mock for now - in production, use geocoding API)
    aiData.dailyPlans.forEach((day: any) => {
      day.activities.forEach((activity: any) => {
        activity.coordinates = { lat: 40.7128 + Math.random() * 0.1, lng: -74.0060 + Math.random() * 0.1 }
      })
    })

    const itinerary: Itinerary = {
      id: Date.now().toString(),
      destination: preferences.destination,
      startDate: preferences.startDate,
      endDate: preferences.endDate,
      budget: preferences.budget,
      travelers: preferences.travelers,
      preferences: preferences.preferences,
      dailyPlans: aiData.dailyPlans,
      totalCost: Math.round(totalCost),
      currency: 'USD',
      createdAt: new Date().toISOString(),
    }

    return itinerary
  } catch (error: any) {
    console.error('Error generating AI itinerary:', error)
    
    // More specific error messages
    if (error.message?.includes('API key') || error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key in settings.')
    }
    
    if (error.message?.includes('quota') || error.status === 429) {
      throw new Error('API rate limit or quota exceeded. Please check your OpenAI account.')
    }
    
    if (error instanceof SyntaxError) {
      console.error('JSON Parse Error. Response was:', error)
      throw new Error('AI response format error. Please try generating again.')
    }
    
    throw new Error(error.message || 'Failed to generate itinerary. Please try again.')
  }
}

