import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import { Itinerary } from '@/types/itinerary'

const ITINERARIES_COLLECTION = 'itineraries'

export interface SavedItinerary extends Itinerary {
  userId: string
  savedAt: any
  isFavorite?: boolean
}

// Save a new itinerary
export async function saveItinerary(
  itinerary: Itinerary,
  userId: string
): Promise<string> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured. Please set up Firebase to save itineraries.')
  }

  const itineraryData: Omit<SavedItinerary, 'id'> = {
    ...itinerary,
    userId,
    savedAt: serverTimestamp(),
    isFavorite: false,
  }

  const docRef = await addDoc(collection(db, ITINERARIES_COLLECTION), itineraryData)
  return docRef.id
}

// Get all itineraries for a user
export async function getUserItineraries(userId: string): Promise<SavedItinerary[]> {
  if (!isFirebaseConfigured || !db) {
    return []
  }

  const q = query(
    collection(db, ITINERARIES_COLLECTION),
    where('userId', '==', userId)
  )

  const querySnapshot = await getDocs(q)
  const itineraries = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SavedItinerary[]

  // Sort in memory instead of requiring a Firestore index
  return itineraries.sort((a, b) => {
    const aTime = a.savedAt?.toMillis?.() || 0
    const bTime = b.savedAt?.toMillis?.() || 0
    return bTime - aTime // Most recent first
  })
}

// Get a single itinerary by ID
export async function getItinerary(itineraryId: string): Promise<SavedItinerary | null> {
  if (!isFirebaseConfigured || !db) {
    return null
  }

  const docRef = doc(db, ITINERARIES_COLLECTION, itineraryId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as SavedItinerary
  }

  return null
}

// Update an itinerary
export async function updateItinerary(
  itineraryId: string,
  updates: Partial<Itinerary>
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }
  const docRef = doc(db, ITINERARIES_COLLECTION, itineraryId)
  await updateDoc(docRef, updates)
}

// Delete an itinerary
export async function deleteItinerary(itineraryId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }
  const docRef = doc(db, ITINERARIES_COLLECTION, itineraryId)
  await deleteDoc(docRef)
}

// Toggle favorite status
export async function toggleFavorite(
  itineraryId: string,
  isFavorite: boolean
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }
  const docRef = doc(db, ITINERARIES_COLLECTION, itineraryId)
  await updateDoc(docRef, { isFavorite })
}




