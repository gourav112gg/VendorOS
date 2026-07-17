import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCnNMofdoCqVYzGdLiG1TlFCH9iKbVdMlA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vendoros-b2c1d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vendoros-b2c1d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vendoros-b2c1d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "706972263259",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:706972263259:web:ba0a3ea52429a2b5d4f07e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KXWJL1WJ1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
