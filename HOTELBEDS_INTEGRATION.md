# 🏨 HotelBeds API Integration

## Overview

The HotelBeds API integration provides **real-time hotel availability, accurate pricing, and actual room options** for your travel itineraries. This is an optional enhancement that works alongside OpenAI and Serper APIs.

## What You Get

✅ **Real Hotel Availability** - Check actual room availability for your travel dates
✅ **Accurate Pricing** - Get real nightly rates, not estimates
✅ **Room Options** - See different room types and their amenities
✅ **Hotel Details** - Access verified hotel information, ratings, and descriptions
✅ **Cancellation Policies** - View cancellation terms for each booking option

## How It Works

### 1. **Setup**
- Get your HotelBeds API credentials (API Key + API Secret) from [HotelBeds Developer Portal](https://www.hotelbeds.com/api)
- Add credentials via the API Settings modal in the app
- Credentials are stored securely in your browser's localStorage

### 2. **Integration Flow**
When you generate an itinerary:
1. **Parallel Data Fetching**: The app simultaneously fetches:
   - OpenAI: AI-powered itinerary structure
   - Serper: Real restaurants & attractions from Google
   - HotelBeds: Real hotel availability & pricing

2. **Destination Mapping**: Converts city names to HotelBeds destination codes

3. **Hotel Search**: Queries HotelBeds with:
   - Destination code
   - Check-in/check-out dates
   - Number of travelers
   - Room requirements

4. **Data Enhancement**: The AI incorporates real hotel data into your itinerary with:
   - Exact hotel names
   - Real nightly rates
   - Verified addresses
   - Room categories
   - Hotel descriptions

### 3. **API Authentication**
HotelBeds uses SHA-256 signature authentication:
```
Signature = SHA256(apiKey + apiSecret + timestamp)
```
This is handled automatically by the integration.

## Test vs Production

The integration uses **HotelBeds Test Environment** by default:
- Base URL: `https://api.test.hotelbeds.com`
- Perfect for development and testing
- No actual bookings are made

For production use, update the `baseUrl` in `/lib/hotelbeds.ts` to:
```typescript
baseUrl: 'https://api.hotelbeds.com'
```

## Features Implemented

### ✅ API Status Check
- Verify API credentials are valid
- Check service availability
- Returns boolean status

### ✅ Check Availability (`checkAvailability`)
- Search hotels by destination, dates, and travelers
- Filter by room requirements
- Get detailed pricing information
- Returns array of available hotels

### ✅ Check Rates (`checkRates`)
- Verify current rates for specific room options
- Use rate keys from availability search
- Get updated pricing and cancellation policies
- Useful for confirming prices before booking

### ✅ Destination Code Lookup
- Automatically maps city names to HotelBeds destination codes
- Handles international destinations
- Includes 50+ fallback codes for major cities
- Works even if API is unavailable

### 🔄 Future Enhancements (Not Yet Implemented)
- Hotel booking functionality
- Booking management and cancellations
- Multi-room searches
- Advanced filtering (price range, star rating, amenities)
- Direct booking links

## API Response Structure

### HotelAvailability
```typescript
{
  code: string              // Hotel code
  name: string              // Hotel name
  categoryCode: string      // Star rating code
  categoryName: string      // e.g., "4 STARS"
  latitude: string          // Location coordinates
  longitude: string
  address?: string          // Street address
  city?: string             // City name
  rooms: Array<{            // Available rooms
    code: string
    name: string
    rates: Array<{          // Rate options
      rateKey: string
      net: number           // Cost in USD
      sellingRate: number
      boardCode: string     // Meal plan code
      boardName: string     // e.g., "ROOM ONLY"
    }>
  }>
  minRate: number           // Lowest price found
  maxRate: number           // Highest price found
  currency: string          // "USD"
  images?: string[]         // Hotel photos
  description?: string      // Hotel description
}
```

## Error Handling

The integration gracefully handles failures:
- **Missing Credentials**: App works without HotelBeds (falls back to AI-generated hotels)
- **Invalid Destination**: Logs warning, continues with AI-generated data
- **API Errors**: Catches errors, continues itinerary generation
- **Network Issues**: Times out gracefully, doesn't block itinerary

## Cost Considerations

HotelBeds API pricing varies by plan:
- **Test Environment**: Usually free for development
- **Production**: Pay-per-request or subscription models
- **Typical Cost**: ~$0.01-0.05 per hotel search
- **Budget-Friendly**: Only calls API when generating itineraries

## Getting API Credentials

1. Visit [HotelBeds Developer Portal](https://www.hotelbeds.com/api)
2. Sign up for a developer account
3. Create a new application
4. Copy your API Key and API Secret
5. Paste them into the app's API Settings modal

## File Structure

```
lib/
  ├── hotelbeds.ts              # Main HotelBeds integration
  ├── aiItineraryGenerator.ts   # Orchestrates OpenAI + Serper + HotelBeds
  └── openai.ts                 # OpenAI client
  
components/
  └── ApiKeyModal.tsx           # UI for managing API credentials
  
app/
  └── plan/page.tsx             # Trip planning page
```

## Configuration Functions

```typescript
// Initialize HotelBeds
initializeHotelBeds(apiKey: string, apiSecret: string)

// Save credentials to localStorage
saveHotelBedsCredentials(apiKey: string, apiSecret: string)

// Check if HotelBeds is configured
hasHotelBeds(): boolean

// Check API status
checkApiStatus(): Promise<boolean>

// Check hotel availability
checkAvailability(params: HotelSearchParams): Promise<HotelAvailability[]>

// Check specific rates
checkRates(rateKeys: string[]): Promise<any[]>

// Legacy: Search hotels (calls checkAvailability)
searchHotels(params: HotelSearchParams): Promise<HotelAvailability[]>

// Get destination code
getDestinationCode(cityName: string): Promise<string | null>
```

## Example Usage

The integration is automatically used when credentials are configured:

```typescript
// 1. Check API Status
const isOnline = await checkApiStatus()
console.log('HotelBeds API:', isOnline ? 'Online' : 'Offline')

// 2. Check Hotel Availability
const hotels = await checkAvailability({
  destination: 'PAR', // Paris destination code
  checkIn: '2025-06-01',
  checkOut: '2025-06-05',
  adults: 2,
  rooms: 1,
})
console.log(`Found ${hotels.length} available hotels`)

// 3. Get rate keys from first hotel
const rateKeys = hotels[0].rooms
  .flatMap(room => room.rates)
  .map(rate => rate.rateKey)
  .slice(0, 3) // Check first 3 rates

// 4. Check current rates
const rates = await checkRates(rateKeys)
console.log('Updated rates:', rates)

// 5. Get destination code for a city
const destCode = await getDestinationCode('Tokyo')
console.log('Tokyo code:', destCode) // 'TYO'
```

## Benefits Over AI-Generated Hotels

| Feature | AI-Generated | HotelBeds Integration |
|---------|-------------|----------------------|
| **Pricing** | Estimated | Real-time actual rates |
| **Availability** | Assumed | Verified availability |
| **Hotel Names** | Generic/fabricated | Real hotel names |
| **Booking** | Not possible | Future: Direct booking |
| **Room Types** | Generic | Actual room categories |
| **Accuracy** | Variable | 100% verified data |

## Troubleshooting

### "HotelBeds API not configured"
- Open API Settings modal
- Add your HotelBeds API Key and Secret
- Click "Save Keys"

### "Could not find destination code"
- Some cities may not be in HotelBeds database
- App will fall back to AI-generated hotels
- Try using a larger nearby city

### "HotelBeds API failed"
- Check your API credentials are correct
- Verify your API key is active
- Check HotelBeds API status
- App will continue with AI-generated data

## Security Notes

- API credentials stored in browser localStorage only
- Never sent to your server
- Only transmitted to HotelBeds API
- Users should keep credentials private
- Use environment variables in production

## Next Steps

To enhance the integration further:
1. Add booking functionality
2. Implement room selection UI
3. Add hotel filtering and sorting
4. Enable multi-room searches
5. Add hotel photo galleries
6. Implement booking management

---

**Integration Status**: ✅ **Active and Ready**

Your app now fetches real hotel data when HotelBeds credentials are configured!

