import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrF-ijyRkIZ29P4bOySRBHdkCZtMG5RJM",
  authDomain: "trikiclick-f8a7c.firebaseapp.com",
  projectId: "trikiclick-f8a7c",
  storageBucket: "trikiclick-f8a7c.appspot.com",
  messagingSenderId: "371774061124",
  appId: "1:371774061124:web:acf752f4992e1640c71a11",
  measurementId: "G-WJJHQLYPE6",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth con persistencia en AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializa Firestore
const db = getFirestore(app);

export { auth, db };
