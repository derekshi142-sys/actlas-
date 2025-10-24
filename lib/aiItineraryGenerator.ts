import { getOpenAI } from './openai'
import { getDestinationData, hasSerper, initializeSerperFromStorage } from './serper'
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

  // Initialize Serper from storage if available
  initializeSerperFromStorage()

  const days = Math.ceil(
    (new Date(preferences.endDate).getTime() - new Date(preferences.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  ) + 1

  // Fetch real data from Serper
  const realPlacesData = hasSerper() 
    ? await (async () => {
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
    : null

  // Build prompt with optional real data from Serper
  let realDataContext = ''
  if (realPlacesData) {
    realDataContext = `

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

Make it realistic, locally accurate, and within the budget. Only include accommodation and transportation for day 1.${realPlacesData ? '\n\n🎯 CRITICAL: Only use the REAL places provided in the Google data section above. Do not invent or fabricate places.' : ''}`

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

