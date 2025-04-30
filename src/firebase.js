// ✅ firebase.js (최신 버전)
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKaKKJ9RmvW_KagTZoM8gMM2-dVqWmXyA",
  authDomain: "verifycode-a2f69.firebaseapp.com",
  projectId: "verifycode-a2f69",
  storageBucket: "verifycode-a2f69.firebasestorage.app",
  messagingSenderId: "1003002699557",
  appId: "1:1003002699557:web:cfb755bed47b2836fb44cc",
  measurementId: "G-QH1NRHNYSZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };