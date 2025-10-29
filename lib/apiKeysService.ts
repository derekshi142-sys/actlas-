import { db } from './firebase'
import { doc, getDoc, setDoc, deleteField, updateDoc } from 'firebase/firestore'

export interface UserApiKeys {
  openai?: string
  serper?: string
  hotelbedsKey?: string
  hotelbedsSecret?: string
}

const COLLECTION_NAME = 'userApiKeys'

/**
 * Save API keys to Firestore for a user
 */
export async function saveApiKeysToFirestore(
  userId: string,
  keys: Partial<UserApiKeys>
): Promise<void> {
  if (!db) {
    console.warn('Firestore not configured - API keys will only be stored locally')
    return
  }

  try {
    const userKeysRef = doc(db, COLLECTION_NAME, userId)
    
    // Merge with existing keys
    await setDoc(userKeysRef, keys, { merge: true })
    
    console.log('✅ API keys saved to Firestore')
  } catch (error) {
    console.error('Error saving API keys to Firestore:', error)
    throw error
  }
}

/**
 * Load API keys from Firestore for a user
 */
export async function loadApiKeysFromFirestore(userId: string): Promise<UserApiKeys | null> {
  if (!db) {
    console.warn('Firestore not configured - loading from localStorage only')
    return null
  }

  try {
    const userKeysRef = doc(db, COLLECTION_NAME, userId)
    const docSnap = await getDoc(userKeysRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserApiKeys
      console.log('✅ API keys loaded from Firestore')
      return data
    } else {
      console.log('No API keys found in Firestore for this user')
      return null
    }
  } catch (error) {
    console.error('Error loading API keys from Firestore:', error)
    return null
  }
}

/**
 * Remove specific API key from Firestore
 */
export async function removeApiKeyFromFirestore(
  userId: string,
  keyName: keyof UserApiKeys
): Promise<void> {
  if (!db) {
    console.warn('Firestore not configured')
    return
  }

  try {
    const userKeysRef = doc(db, COLLECTION_NAME, userId)
    await updateDoc(userKeysRef, {
      [keyName]: deleteField()
    })
    
    console.log(`✅ API key '${keyName}' removed from Firestore`)
  } catch (error) {
    console.error('Error removing API key from Firestore:', error)
    throw error
  }
}

/**
 * Remove all API keys from Firestore for a user
 */
export async function removeAllApiKeysFromFirestore(userId: string): Promise<void> {
  if (!db) {
    console.warn('Firestore not configured')
    return
  }

  try {
    const userKeysRef = doc(db, COLLECTION_NAME, userId)
    await setDoc(userKeysRef, {})
    
    console.log('✅ All API keys removed from Firestore')
  } catch (error) {
    console.error('Error removing all API keys from Firestore:', error)
    throw error
  }
}

