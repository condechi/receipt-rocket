
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

// Helper to convert camelCase to SNAKE_CASE for env var names
const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toUpperCase();

// More specific check for placeholder values
const placeholderTexts: Record<keyof typeof firebaseConfigValues, string> = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

const unreplacedPlaceholders = (Object.keys(firebaseConfigValues) as Array<keyof typeof firebaseConfigValues>)
  .filter(key => firebaseConfigValues[key] === placeholderTexts[key]);

if (unreplacedPlaceholders.length > 0) {
  const vars = unreplacedPlaceholders.map(key => `NEXT_PUBLIC_FIREBASE_${toSnakeCase(key)}`).join(', ');
  const message = `Firebase config error: The following environment variables in .env.local still seem to contain placeholder values: ${vars}. Please replace them with your actual Firebase project credentials and restart the development server.`;
  console.error(message);
  throw new Error(message);
}

// Check for missing essential Firebase config values
const essentialKeys: (keyof typeof firebaseConfigValues)[] = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = essentialKeys.filter(key => {
  const value = firebaseConfigValues[key];
  return !value || String(value).trim() === ''; // Check for undefined, null, or empty string
});

if (missingKeys.length > 0) {
  const vars = missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${toSnakeCase(key)}`).join(', ');
  const message = `Firebase config error: The following required environment variables are missing or empty: ${vars}. Please check your .env.local file, ensure all values are correctly set, and restart the Next.js development server.`;
  console.error(message);
  throw new Error(message);
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  console.log('Firebase: Attempting to initialize with config:', firebaseConfigValues);
  app = initializeApp(firebaseConfigValues);
} else {
  app = getApp();
  // console.log('Firebase: Using existing app instance.');
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // For future image uploads to Firebase Storage
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
