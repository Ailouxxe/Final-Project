import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables or default values
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAMNN24gZJw9VOiJvSGZxHOomD0Aqgd-do",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || "appdev-27760"}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "appdev-27760",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || "appdev-27760"}.firebasestorage.app`,
  messagingSenderId: "500561191014",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:500561191014:web:8025c3db82c865ac45cda7",
  databaseURL: "https://appdev-27760-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
