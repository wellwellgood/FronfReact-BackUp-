// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { analytics } from 'some-analytics-library';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnf5OyzhrqwhqKmXiaHZIOp-a2mSfA1IM",
  authDomain: "googl-login-c6ab4.firebaseapp.com",
  projectId: "googl-login-c6ab4",
  storageBucket: "googl-login-c6ab4.firebasestorage.app",
  messagingSenderId: "699802080980",
  appId: "1:699802080980:web:2fd0cf851ee689b2bccd41",
  measurementId: "G-GMQN8MBHC6"
};
analytics.track('page_view', { page: 'home' });
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);