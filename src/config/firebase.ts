import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

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

// Enable auth persistence and set language
auth.useDeviceLanguage()

export default app