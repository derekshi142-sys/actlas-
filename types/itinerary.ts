export interface Activity {
  time: string
  title: string
  description: string
  location: string
  duration: string
  cost: number
  type: 'activity' | 'arrival' | 'departure'
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface Meal {
  restaurant: string
  cuisine: string
  cost: number
  location: string
}

export interface Accommodation {
  name: string
  type: string
  address: string
  checkIn: string
  checkOut: string
  pricePerNight: number
  amenities: string[]
  rating: number
}

export interface Transportation {
  outbound: {
    type: string
    from: string
    to: string
    departure: string
    arrival: string
    cost: number
    airline?: string
    class?: string
  }
  local: {
    type: string
    provider: string
    costPerDay: number
    pickupLocation: string
  }
}

export interface DailyPlan {
  day: number
  date: string
  activities: Activity[]
  meals: {
    breakfast: Meal
    lunch: Meal
    dinner: Meal
  }
  accommodation?: Accommodation | null
  transportation?: Transportation | null
}

export interface Itinerary {
  id: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  preferences: string[]
  dailyPlans: DailyPlan[]
  totalCost: number
  currency: string
  createdAt: string
}

