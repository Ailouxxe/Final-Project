import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtIXaTAtMWSuhttXb_B3_pjo2ikiQUMYs",
  authDomain: "appdev-project-cfb61.firebaseapp.com",
  projectId: "appdev-project-cfb61",
  storageBucket: "appdev-project-cfb61.firebasestorage.app",
  messagingSenderId: "119314580599",
  appId: "1:119314580599:web:2dad78338d1968d1cd7272",
  databaseURL: "https://appdev-project-cfb61-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
