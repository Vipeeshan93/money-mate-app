// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmFJsUaSidqaDgv2iREG6-mqKxfp_IRAw",
  authDomain: "moneymate-6a1c0.firebaseapp.com",
  projectId: "moneymate-6a1c0",
  storageBucket: "moneymate-6a1c0.firebasestorage.app",
  messagingSenderId: "78639258900",
  appId: "1:78639258900:web:79f665b5016c63e433b601"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };