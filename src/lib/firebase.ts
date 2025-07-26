// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOVuRBdKBfEmNGTsopDZzceTZCZWjB254",
  authDomain: "combixapp.firebaseapp.com",
  projectId: "combixapp",
  storageBucket: "combixapp.appspot.com",
  messagingSenderId: "772803843815",
  appId: "1:772803843815:web:01d917e388d4578934b442",
  measurementId: "G-NZ3YXC50RD"
};

// Google OAuth configuration
// استخدام متغيرات بيئية أو قيم افتراضية للتطوير المحلي
export const googleOAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics if available
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// We're now using real Firebase credentials
// If you want to use emulators for local development, uncomment the code below

/*
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only connect to emulators in browser environment and in development mode
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    
    console.log("Connected to Firebase emulators");
  } catch (error) {
    console.error("Failed to connect to Firebase emulators:", error);
  }
}
*/