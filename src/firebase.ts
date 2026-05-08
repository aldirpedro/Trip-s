import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "TUA_API_KEY",
  authDomain: "TEU_PROJETO.firebaseapp.com",
  databaseURL: "https://TEU_PROJETO.firebaseio.com",
  projectId: "TEU_PROJETO",
  storageBucket: "TEU_PROJETO.appspot.com",
  messagingSenderId: "ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);