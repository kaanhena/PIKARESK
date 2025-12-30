// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhgN6szChqa6YRYdog_mnqrCkVX7wGxkg",
  authDomain: "pikaresk-7f80b.firebaseapp.com",
  projectId: "pikaresk-7f80b",
  storageBucket: "pikaresk-7f80b.firebasestorage.app",
  messagingSenderId: "1003436565802",
  appId: "1:1003436565802:web:c0f7bb038e980e6c2fea53",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
