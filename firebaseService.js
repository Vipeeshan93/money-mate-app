// firebaseService.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config (from firebaseConfig.js)
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };