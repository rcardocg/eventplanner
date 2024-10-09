// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByf0Kr_p25ZnY-xRc5CvsgzxP-OWuv0VY",
  authDomain: "devfest-cd6b4.firebaseapp.com",
  projectId: "devfest-cd6b4",
  storageBucket: "devfest-cd6b4.appspot.com",
  messagingSenderId: "169607328634",
  appId: "1:169607328634:web:2508a5d9cc1e72cf321cc3",
  measurementId: "G-2EX71F5GSR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)

export {db}