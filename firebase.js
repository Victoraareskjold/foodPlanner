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
  apiKey: "AIzaSyBivSu1pTDmTFW5IDzthgmtyl_0S8z-n38",
  authDomain: "foodplanner-4b696.firebaseapp.com",
  projectId: "foodplanner-4b696",
  storageBucket: "foodplanner-4b696.appspot.com",
  messagingSenderId: "145168551385",
  appId: "1:145168551385:web:d4899044ec947e5e581dc8",
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
