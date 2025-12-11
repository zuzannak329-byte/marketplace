
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAq3O_ceqI5XqS4v7VatlgnwTeST1MiKKg",
  authDomain: "marketplace-c572f.firebaseapp.com",
  projectId: "marketplace-c572f",
  storageBucket: "marketplace-c572f.firebasestorage.app",
  messagingSenderId: "417396381054",
  appId: "1:417396381054:web:ce410fdd74a7eb85ca8f2f",
  measurementId: "G-TBF5L9FFJJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };