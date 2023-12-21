// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-2ce00.firebaseapp.com",
  projectId: "mern-estate-2ce00",
  storageBucket: "mern-estate-2ce00.appspot.com",
  messagingSenderId: "369530046586",
  appId: "1:369530046586:web:d6ce905783bb2c569ad3c3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);