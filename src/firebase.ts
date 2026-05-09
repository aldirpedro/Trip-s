import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/*
  Substitua os valores abaixo pelas credenciais reais do seu projeto Firebase.
  Estas credenciais estão no Firebase Console > Project Settings > Your apps.
*/
const firebaseConfig = {
  apiKey: "COLOQUE_AQUI_SUA_API_KEY",
  authDomain: "COLOQUE_AQUI_SEU_AUTH_DOMAIN",
  databaseURL: "COLOQUE_AQUI_SEU_DATABASE_URL",
  projectId: "COLOQUE_AQUI_SEU_PROJECT_ID",
  storageBucket: "COLOQUE_AQUI_SEU_STORAGE_BUCKET",
  messagingSenderId: "COLOQUE_AQUI_SEU_MESSAGING_SENDER_ID",
  appId: "COLOQUE_AQUI_SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);