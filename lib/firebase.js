import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables or default values
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCtIXaTAtMWSuhttXb_B3_pjo2ikiQUMYs",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || "appdev-project-cfb61"}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "appdev-project-cfb61",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || "appdev-project-cfb61"}.firebasestorage.app`,
  messagingSenderId: "119314580599",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:119314580599:web:2dad78338d1968d1cd7272",
  databaseURL: "https://appdev-project-cfb61-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
