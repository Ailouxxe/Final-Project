import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables or default values
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBdKzg_ER_grNeFllbCWfHi2W0qLlbPkxQ",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || "appdev-82916"}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "appdev-82916",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || "appdev-82916"}.firebasestorage.app`,
  messagingSenderId: "369191156434",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:369191156434:web:d5f6df2f5d64286eefcb0b",
  databaseURL: "https://appdev-82916-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
