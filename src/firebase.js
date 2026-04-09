import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBh9OyiRQ4CXA6eDKWnnqz1T9Y_4S_q4a4",
  authDomain: "movies-hub-8b155.firebaseapp.com",
  projectId: "movies-hub-8b155",
  appId: "1:207433996129:web:ef5045368fef4bc50c9720",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
