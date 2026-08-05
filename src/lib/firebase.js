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
  apiKey: "REPLACE_ME",
  authDomain: "repetitor-crm.firebaseapp.com",
  databaseURL: "https://repetitor-crm-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "repetitor-crm",
  storageBucket: "repetitor-crm.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

const ROOT = "repetitor/tenants";

export const tenantPath = (tenantId, ...segments) =>
  [ROOT, tenantId, ...segments].filter(Boolean).join("/");

export { ref, get, set, push, update, remove, onValue };
