import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARPY9aRtzDPHlQXUmLBUVtpeYoE3-ssV4",
  authDomain: "khatma-data.firebaseapp.com",
  projectId: "khatma-data",
  storageBucket: "khatma-data.appspot.com", // <-- Corrected value
  messagingSenderId: "697176212018",
  appId: "1:697176212018:web:1942990a1b240d282e722b",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
