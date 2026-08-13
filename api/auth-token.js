// Vercel serverless function — PIN-i serverdə (Admin SDK ilə) yoxlayır və
// tenantId-yə bağlı Firebase custom auth token qaytarır.
//
// TƏLƏB OLUNAN ENV DƏYİŞƏNİ (Vercel Dashboard -> Settings -> Environment Variables):
//   FIREBASE_SERVICE_ACCOUNT = Firebase Console -> Project Settings -> Service Accounts
//                               -> "Generate new private key" ilə endirilən JSON-un
//                               TAM MƏTNİ (bir sətirdə, dırnaqları ilə birgə).
//
// Bu dəyişən qurulmayıbsa, funksiya sadəcə xəta qaytarır — köhnə PIN-only giriş axını
// (localStorage-əsaslı) bundan asılı deyil və işləməyə davam edir.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env dəyişəni qurulmayıb");
  const serviceAccount = JSON.parse(raw);
  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://reperitor-default-rtdb.europe-west1.firebasedatabase.app",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Yalnız POST" });
    return;
  }

  try {
    const { tenantId, pin, mode } = req.body || {};
    if (!tenantId) {
      res.status(400).json({ error: "tenantId lazımdır" });
      return;
    }

    const adminApp = getAdminApp();
    const db = getDatabase(adminApp);

    if (mode === "register") {
      // Qeydiyyat rejimi: hələ PIN yoxdur (indi yaradılır). Yalnız bu tenantId
      // artıq mövcud DEYİLSƏ token veririk — beləliklə kimsə mövcud bir tenantId-ni
      // "qeydiyyatdan keçirərək" üstündən yaza bilməz.
      const existing = await db.ref(`repetitor/tenants/${tenantId}/profil`).get();
      if (existing.exists()) {
        res.status(409).json({ error: "Bu tenant artıq mövcuddur" });
        return;
      }
      const token = await getAuth(adminApp).createCustomToken(tenantId);
      res.status(200).json({ token });
      return;
    }

    if (!pin) {
      res.status(400).json({ error: "pin lazımdır" });
      return;
    }
    const snap = await db.ref(`repetitor/tenants/${tenantId}/profil`).get();
    if (!snap.exists()) {
      res.status(404).json({ error: "Tenant tapılmadı" });
      return;
    }
    const profil = snap.val();
    if (String(profil.pin) !== String(pin)) {
      res.status(401).json({ error: "PIN səhvdir" });
      return;
    }

    const token = await getAuth(adminApp).createCustomToken(tenantId);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message || "Naməlum xəta" });
  }
}
