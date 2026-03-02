// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALelRl9Xi3kJ6aMRYDGULuU0rLAv93vy0",
  authDomain: "ai-clinic-management-app.firebaseapp.com",
  projectId: "ai-clinic-management-app",
  storageBucket: "ai-clinic-management-app.firebasestorage.app",
  messagingSenderId: "192189030455",
  appId: "1:192189030455:web:0340feea16235c2a5bdfb2",
  measurementId: "G-Z7K2HE7HYV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, }