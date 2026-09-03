// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfaFEh5ReLfsUFgOPIDgbb2Gbntzb-EOY",
  authDomain: "swarrnim-erp-prod.firebaseapp.com",
  projectId: "swarrnim-erp-prod",
  storageBucket: "swarrnim-erp-prod.firebasestorage.app",
  messagingSenderId: "1070816627211",
  appId: "1:1070816627211:web:0947736d9feffece0c950e",
  measurementId: "G-2GBGBC6P7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);