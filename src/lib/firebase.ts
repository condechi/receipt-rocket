
// Suggested code may be subject to a license. Learn more: ~LicenseLog:2358882217.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:1721246237.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:126657499.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:816490147.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:2329870203.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:1596052699.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions'; // Import getFunctions
import { getStorage } from 'firebase/storage';

// Helper to convert camelCase to SNAKE_CASE for env var names
const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toUpperCase();

// These are the values that should be populated from your .env.local file
const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// These are the exact placeholder strings that were in the template .env.local file.
// If the values loaded from process.env match these, it means the user hasn't updated them.
const placeholderTexts = {
  apiKey: "AIzaSyAIAODH5biBx2E3Vfb9uK9CFiBtkiFt7lE",
  authDomain: "receipt-rocket-q7pi9.firebaseapp.com",
  projectId: "receipt-rocket-q7pi9",
  storageBucket: "receipt-rocket-q7pi9.firebasestorage.app",
  messagingSenderId: "1026381189533",
  appId: "1:1026381189533:web:4280ff79b3ddf26ae09f74"
};

// Check if any of the loaded config values still match the initial placeholder texts
const unreplacedPlaceholders = (Object.keys(firebaseConfigValues) as Array<keyof typeof firebaseConfigValues>)
  .filter(key => firebaseConfigValues[key] === placeholderTexts[key]);

if (unreplacedPlaceholders.length > 0) {
  const vars = unreplacedPlaceholders.map(key => `NEXT_PUBLIC_FIREBASE_${toSnakeCase(key)}`).join(', ');
  const detailedValues = JSON.stringify(firebaseConfigValues, null, 2);
  const message = `
##########################################################################################
# FIREBASE CONFIGURATION ERROR                                                           #
##########################################################################################
#
# The application has detected that one or more Firebase environment variables
# defined in your '.env.local' file (located in the project root directory)
# still contain placeholder values.
#
# Problematic Variable(s) using placeholders:
#   [${vars}]
#
# Current values being read by the application (from .env.local or system environment):
# ${detailedValues}
#
# To fix this:
# 1. Open the '.env.local' file located in the ROOT of your project directory.
# 2. For EACH variable listed above, replace its current placeholder value
#    (e.g., "AIzaSy..." or "your-project-id") with your ACTUAL Firebase project credential.
#    You can find these credentials in your Firebase Console:
#      - Go to Project settings (gear icon)
#      - Under the "General" tab, scroll to "Your apps"
#      - Select your web app
#      - Find the "SDK setup and configuration" section and choose "Config".
# 3. Ensure there are no typos or extra spaces around the values in '.env.local'.
# 4. Save the '.env.local' file.
# 5. CRITICAL: STOP your Next.js development server completely (e.g., Ctrl+C in the terminal).
# 6. RESTART your Next.js development server (e.g., by running 'npm run dev').
#
# The server MUST be fully restarted for Next.js to pick up the changes in '.env.local'.
# If the issue persists after these steps, double-check the variable names and values
# in '.env.local' against your Firebase project settings.
#
##########################################################################################
`;
  console.error(message); // This detailed message will appear in your server console
  throw new Error("Firebase configuration contains placeholder values. Check server console for details and instructions.");
}

// Check for missing essential Firebase config values (undefined or empty strings)
// This check runs AFTER the placeholder check, so if placeholders are an issue, you'll see that error first.
const essentialKeys: (keyof typeof firebaseConfigValues)[] = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = essentialKeys.filter(key => {
  const value = firebaseConfigValues[key];
  return !value || String(value).trim() === '';
});

if (missingKeys.length > 0) {
  const vars = missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${toSnakeCase(key)}`).join(', ');
  const detailedValues = JSON.stringify(firebaseConfigValues, null, 2);
  const message = `
##########################################################################################
# FIREBASE CONFIGURATION ERROR                                                           #
##########################################################################################
#
# One or more essential Firebase environment variables are MISSING or EMPTY
# in your '.env.local' file (located in the project root directory)
# or are not being correctly picked up by the application.
#
# Missing/Empty Essential Variable(s):
#   [${vars}]
#
# Current values being read by the application:
# ${detailedValues}
#
# To fix this:
# 1. Ensure your '.env.local' file exists in the ROOT of your project directory.
# 2. Ensure ALL required Firebase environment variables (especially NEXT_PUBLIC_FIREBASE_API_KEY,
#    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID)
#    are present in '.env.local' and have their correct values from your Firebase project.
#    (Find these in your Firebase Console > Project Settings > General > Your Apps > SDK setup and configuration)
# 3. Save the '.env.local' file.
# 4. CRITICAL: STOP your Next.js development server completely.
# 5. RESTART your Next.js development server (e.g., by running 'npm run dev').
#
# The server MUST be fully restarted for these changes to take effect.
#
##########################################################################################
`;
  console.error(message); // This detailed message will appear in your server console
  throw new Error("Firebase configuration missing essential values. Check server console for details and instructions.");
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
const functions = getFunctions(app); // Get Firebase Functions instance
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, functions, googleProvider };

