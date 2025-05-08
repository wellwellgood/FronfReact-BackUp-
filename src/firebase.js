// firebase.js - Improved Firebase initialization with better error handling
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialization tracking
let isInitialized = false;
let isInitializing = false;
let initializationPromise = null;
let app = null;
let auth = null;
let db = null;

/**
 * Initialize Firebase services with proper error handling
 * @returns {Promise<{app, auth, db}>} - Initialized Firebase services
 */
const initializeFirebase = () => {
  // If already initialized, return existing instances
  if (isInitialized) {
    return Promise.resolve({ app, auth, db });
  }
  
  // If initialization is in progress, return the existing promise
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }
  
  // Set initialization flag
  isInitializing = true;
  
  // Create initialization promise
  initializationPromise = new Promise((resolve, reject) => {
    try {
      // Initialize Firebase app
      app = initializeApp(firebaseConfig);
      console.log("✅ Firebase app initialized");
      
      // Initialize Auth service
      auth = getAuth(app);
      console.log("✅ Firebase Auth initialized");
      
      // Initialize Firestore
      db = getFirestore(app);
      console.log("✅ Firestore initialized");
      
      // Initialize AppCheck in production only
      if (process.env.NODE_ENV === 'production') {
        try {
          initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_KEY),
            isTokenAutoRefreshEnabled: true,
          });
          console.log("✅ Firebase AppCheck initialized");
        } catch (appCheckError) {
          console.warn("⚠️ AppCheck initialization failed (optional):", appCheckError);
          // Continue even if AppCheck fails, as it's optional
        }
      }
      
      // Set initialization flags
      isInitialized = true;
      isInitializing = false;
      
      // Resolve with Firebase services
      resolve({ app, auth, db });
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      
      // Reset flags
      isInitialized = false;
      isInitializing = false;
      initializationPromise = null;
      
      // Reject with error
      reject(error);
    }
  });
  
  return initializationPromise;
};

/**
 * Safely get Firebase Auth instance, initializing if needed
 * @returns {Promise<Auth>} Firebase Auth instance
 */
const getFirebaseAuth = async () => {
  try {
    const { auth: authInstance } = await initializeFirebase();
    return authInstance;
  } catch (error) {
    console.error("❌ Failed to get Firebase Auth:", error);
    throw error;
  }
};

/**
 * Safely get Firestore instance, initializing if needed
 * @returns {Promise<Firestore>} Firestore instance
 */
const getFirestoreDb = async () => {
  try {
    const { db: dbInstance } = await initializeFirebase();
    return dbInstance;
  } catch (error) {
    console.error("❌ Failed to get Firestore:", error);
    throw error;
  }
};

// Initialize Firebase on module load
initializeFirebase().catch(error => {
  console.error("❌ Automatic Firebase initialization failed:", error);
  // Don't throw here, let individual components handle retries
});

export { 
  initializeFirebase, 
  getFirebaseAuth,
  getFirestoreDb,
  app, // For compatibility with existing code
  auth, // For compatibility with existing code
  db // For compatibility with existing code
};