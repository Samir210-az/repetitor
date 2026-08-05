import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, update, remove, onValue } from "firebase/database";

// TODO (Samir): Firebase Console-da yeni layihə yarat -> "repetitor"
// Layihə Settings -> General -> "Your apps" -> Web app əlavə et -> config-i bura yapışdır.
// Realtime Database yaradanda REGION seç (məs. Europe) və rules-u aşağıdakı kimi et:
//
// {
//   "rules": {
//     "repetitor": {
//       "tenants": {
//         "$tenantId": {
//           ".read": true,
//           ".write": true
//         }
//       }
//     }
//   }
// }
//
// (Sonra istəsən daha sərt PIN-əsaslı qaydalara keçirərik.)

const firebaseConfig = {
  apiKey: "AIzaSyCyHPpvIuUZszE4krjv3bY4zfRBMr-U-bE",
  authDomain: "reperitor.firebaseapp.com",
  databaseURL: "https://reperitor-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "reperitor",
  storageBucket: "reperitor.firebasestorage.app",
  messagingSenderId: "627833200270",
  appId: "1:627833200270:web:53253682b4bf33f5c5f3df",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

const ROOT = "repetitor/tenants";

export const tenantPath = (tenantId, ...segments) =>
  [ROOT, tenantId, ...segments].filter(Boolean).join("/");

export { ref, get, set, push, update, remove, onValue };
