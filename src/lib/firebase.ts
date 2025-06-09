
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing essential Firebase config values
const essentialKeys: (keyof typeof firebaseConfigValues)[] = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = essentialKeys.filter(key => {
  const value = firebaseConfigValues[key];
  return !value || value.trim() === ''; // Check for undefined, null, or empty string
});

if (missingKeys.length > 0) {
  const message = `Firebase config error: The following required environment variables are missing or empty: ${missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${key.replace('firebase', '').toUpperCase()}`).join(', ')}. Please check your .env.local file, ensure all values are correctly set, and restart the Next.js development server.`;
  console.error(message);
  // Throw an error to halt initialization if config is critically missing
  throw new Error(message);
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfigValues);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // For future image uploads to Firebase Storage
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
