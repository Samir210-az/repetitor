import { db, ref, push, set } from "./firebase.js";

function parseDevice(ua) {
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux";
  return "Naməlum";
}

function parseBrowser(ua) {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Naməlum";
}

export async function trackVisit(sehife) {
  try {
    const geo = await fetch("https://ipwho.is/").then((r) => r.json()).catch(() => null);
    const ua = navigator.userAgent || "";
    const r = push(ref(db, "repetitor/analytics"));
    await set(r, {
      ip: geo?.ip || "naməlum",
      sehir: geo?.city || "",
      olke: geo?.country || "",
      isp: geo?.connection?.isp || "",
      sehife,
      cihaz: parseDevice(ua),
      brauzer: parseBrowser(ua),
      referrer: document.referrer || "",
      tarix: Date.now(),
    });
  } catch {
    // sükutla keç — analytics saytın işləməsinə mane olmamalıdır
  }
}
