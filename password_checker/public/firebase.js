// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9aBXvIDHbI7EthXYgbYS-IwicubgQE6Q",
  authDomain: "passwordcheckerapp.firebaseapp.com",
  projectId: "passwordcheckerapp",
  storageBucket: "passwordcheckerapp.firebasestorage.app",
  messagingSenderId: "91700954801",
  appId: "1:91700954801:web:c4187f385f9ecfbe4a0490",
  measurementId: "G-4TTMLTMY39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);