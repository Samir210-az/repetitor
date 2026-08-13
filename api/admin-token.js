// Vercel serverless function — SuperAdmin panelinin PIN-ini server tərəfdə yoxlayır
// və "admin: true" claim-li Firebase custom token qaytarır. Bu, /master panelinin
// bütün tenant-ları idarə edə bilməsi (uzatma, silmə, redaktə) üçün lazımdır —
// çünki admin heç bir konkret tenant kimi daxil olmur, ayrıca bir "admin" şəxsiyyəti
// kimi Firebase Auth-a qoşulur.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ADMIN_PIN = "AL2026EA";

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
    const { pin } = req.body || {};
    if (pin !== ADMIN_PIN) {
      res.status(401).json({ error: "PIN səhvdir" });
      return;
    }
    const adminApp = getAdminApp();
    const token = await getAuth(adminApp).createCustomToken("__admin__", { admin: true });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message || "Naməlum xəta" });
  }
}
