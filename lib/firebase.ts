import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCCVXqQZZbFchq6S0AidOZkYMcSQXUpJos',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'final-vacation-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'final-vacation-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'final-vacation-project.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '323074916301',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:323074916301:web:0d37472cc7c312635a0e84',
}

// Check if Firebase is configured
const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== '')

// Initialize Firebase only if configured
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    console.info('✅ Firebase initialized successfully - Login and trip saving enabled!')
  } catch (error) {
    // Firebase initialization failed - app will work without it
    console.error('❌ Firebase initialization failed:', error)
    console.info('App will continue without authentication and trip saving')
  }
} else {
  // Firebase not configured - app will work in demo mode
  console.info('🚀 App running without Firebase - you can still generate itineraries!')
}

export { app, auth, db, isFirebaseConfigured }

