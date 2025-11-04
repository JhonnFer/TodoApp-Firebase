// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACNkyJjsFcaU5htP_xAoPbD1LjnaHe9vg",
  authDomain: "epn-proyectos-38e79.firebaseapp.com",
  projectId: "epn-proyectos-38e79",
  storageBucket: "epn-proyectos-38e79.firebasestorage.app",
  messagingSenderId: "965066273373",
  appId: "1:965066273373:web:5adb990cf593270d16d3b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);