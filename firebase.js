import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7XjzpGyl_HfENSIJMGcxqDB8pB5LNQwk",
  authDomain: "assistas-7e5e7.firebaseapp.com",
  projectId: "assistas-7e5e7",
  storageBucket: "assistas-7e5e7.appspot.com",
  messagingSenderId: "760338202898",
  appId: "1:760338202898:web:b2a693280ef80127a4f3cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
