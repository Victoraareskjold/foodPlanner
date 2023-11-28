import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7XjzpGyl_HfENSIJMGcxqDB8pB5LNQwk",
  authDomain: "assistas-7e5e7.firebaseapp.com",
  projectId: "assistas-7e5e7",
  storageBucket: "assistas-7e5e7.appspot.com",
  messagingSenderId: "760338202898",
  appId: "1:760338202898:web:b2a693280ef80127a4f3cb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const storage = getStorage(app);

export { auth, db, storage };

export default app;
