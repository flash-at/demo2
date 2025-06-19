import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
  authDomain: "portfolio-56be7.firebaseapp.com",
  projectId: "portfolio-56be7",
  storageBucket: "portfolio-56be7.firebasestorage.app",
  messagingSenderId: "888511551571",
  appId: "1:888511551571:web:11e809e995377e9a4ccea6",
  measurementId: "G-X3CYL9YZR1"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Enable auth persistence
auth.useDeviceLanguage()

// Only connect to emulator in development and if not already connected
if (process.env.NODE_ENV === 'development') {
  // Check if emulator is already connected
  const isEmulatorConnected = auth.config.emulator !== null

  if (!isEmulatorConnected) {
    try {
      // Test if emulator is available before connecting
      const testConnection = await fetch('http://localhost:9099', { 
        method: 'GET',
        mode: 'no-cors'
      }).catch(() => null)
      
      // Only connect if we can reach the emulator
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
      console.log('Connected to Firebase Auth Emulator')
    } catch (error) {
      // Emulator connection failed, continue with production auth
      console.log('Auth emulator not available, using production Firebase Auth')
    }
  }
}

export default app