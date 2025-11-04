// Firebaseconfig.ts

// Importaciones base
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🛑 SOLUCIÓN DE RESOLUCIÓN DE MÓDULOS: Importar directamente desde 'firebase/auth'
// y confiar en que la configuración del tsconfig.json y el bundler lo resuelvan.
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth'; 
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACNkyJjsFcaU5htP_xAoPbD1LjnaHe9vg",
  authDomain: "epn-proyectos-38e79.firebaseapp.com",
  projectId: "epn-proyectos-38e79",
  storageBucket: "epn-proyectos-38e79.firebasestorage.app",
  messagingSenderId: "965066273373",
  appId: "1:965066273373:web:5adb990cf593270d16d3b4"
};

// Initialize Firebase App (manejo de Hot Reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🛑 Inicialización de Auth con Persistencia de Sesión
// Nota: Usamos initializeAuth con el persistencia.
export const auth = initializeAuth(app, {
 persistence: getReactNativePersistence(ReactNativeAsyncStorage), 
});

export const db = getFirestore(app);