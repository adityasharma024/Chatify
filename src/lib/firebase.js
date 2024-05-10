
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatify-e956e.firebaseapp.com",
  projectId: "chatify-e956e",
  storageBucket: "chatify-e956e.appspot.com",
  messagingSenderId: "566746292496",
  appId: "1:566746292496:web:3f0ec7cc5a0a951baa4595",
  measurementId: "G-D010M49ZG2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth=getAuth()
export const db=getFirestore();
export const storage=getStorage();