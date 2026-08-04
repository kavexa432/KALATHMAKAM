import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfNogJDB5jCENkBHIhth8fnz-87vlKe3I",
  authDomain: "kalathmakam-5783c.firebaseapp.com",
  projectId: "kalathmakam-5783c",
  storageBucket: "kalathmakam-5783c.firebasestorage.app",
  messagingSenderId: "875256530698",
  appId: "1:875256530698:web:8d67776ef5adf851a5dcf3",
  measurementId: "G-0JW5D5PD8R"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics safely checked for browser environment
export const analytics = typeof window !== 'undefined'
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
  : null;

// Export Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export Firestore Database & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
