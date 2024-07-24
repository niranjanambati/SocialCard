import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyAFZebIs3sj4R9kpjRBE5HPxldB1K_kWgI",
  authDomain: "socialcard-3e829.firebaseapp.com",
  projectId: "socialcard-3e829",
  storageBucket: "socialcard-3e829.appspot.com",
  messagingSenderId: "947938927701",
  appId: "1:947938927701:web:2f9aa3a166b230f496a0dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const storage = getStorage(app)
export default app
export {getFirestore,collection, doc, getDoc, setDoc };