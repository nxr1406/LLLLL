import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBuhDDOQA2vJOfwL2KBTH3d_xbp3AlbjPg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "linkup-c22fa.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://linkup-c22fa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "linkup-c22fa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "linkup-c22fa.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1030175932136",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1030175932136:web:8f105f9279379ccb5a535d",
  measurementId: "G-4XE0CXFGXD"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
