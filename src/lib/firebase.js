import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, update, remove, onValue } from "firebase/database";
import { getAuth, signInWithCustomToken, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";

// Firebase Realtime Database qaydaları (2026 — Faza 2, təhlükəsizləşdirilib):
// - repetitor/tenants/$tenantId yalnız auth.uid === $tenantId olan (yəni öz PIN-i ilə
//   daxil olmuş müəllim) yaza bilər.
// - İstisna: testler/$testId/neticeler/$sagirdId və sagirdler/$sagirdId/neticeler/$testId
//   açıq saxlanılıb — şagirdlər login olmadan imtahan nəticəsi göndərə bilsin deyə.
// - phone_index, analytics, sualBanki, hazirTestler ayrıca açıq node-lardır.
// Qaydaların tam mətni: Firebase Console -> Realtime Database -> Rules.

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
export const auth = getAuth(app);

// ---- Əsl Firebase Auth (custom token) — Faza 1: əlavə, mövcud PIN axınını pozmur ----
// Login/Qeydiyyatdan sonra çağırılır. /api/auth-token PIN-i serverdə (Admin SDK ilə)
// yoxlayır və tenantId-yə bağlı custom token qaytarır. Uğursuz olsa (məs. hələ
// FIREBASE_SERVICE_ACCOUNT qurulmayıb), səssizcə keçilir — köhnə axın toxunulmaz qalır.
export async function signInTenant(tenantId, pin) {
  try {
    const res = await fetch("/api/auth-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, pin }),
    });
    if (!res.ok) return { ok: false, reason: `http-${res.status}` };
    const data = await res.json();
    if (!data?.token) return { ok: false, reason: "no-token" };
    await signInWithCustomToken(auth, data.token);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err?.message || "unknown" };
  }
}

// Qeydiyyat üçün: profil yazılmazdan ƏVVƏL çağırılmalıdır ki, "tenants/$tenantId"
// üzərində Firebase Auth tələb edən yazma qaydası qeydiyyatı bloklamasın.
// Server (/api/auth-token, mode=register) yalnız tenantId hələ mövcud deyilsə token verir.
export async function registerTenant(tenantId) {
  try {
    const res = await fetch("/api/auth-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, mode: "register" }),
    });
    if (!res.ok) return { ok: false, reason: `http-${res.status}` };
    const data = await res.json();
    if (!data?.token) return { ok: false, reason: "no-token" };
    await signInWithCustomToken(auth, data.token);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err?.message || "unknown" };
  }
}

export async function signInAdmin(pin) {
  try {
    const res = await fetch("/api/admin-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) return { ok: false, reason: `http-${res.status}` };
    const data = await res.json();
    if (!data?.token) return { ok: false, reason: "no-token" };
    await signInWithCustomToken(auth, data.token);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err?.message || "unknown" };
  }
}

export async function signOutTenant() {
  try {
    await fbSignOut(auth);
  } catch {
    /* səssiz — signOut heç vaxt UI-ı bloklamamalıdır */
  }
}

export { onAuthStateChanged };

const ROOT = "repetitor/tenants";

export const tenantPath = (tenantId, ...segments) =>
  [ROOT, tenantId, ...segments].filter(Boolean).join("/");

export { ref, get, set, push, update, remove, onValue };
