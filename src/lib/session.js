const KEY = "repetitor_session";

export function saveSession(tenantId, profile) {
  localStorage.setItem(KEY, JSON.stringify({ tenantId, profile, ts: Date.now() }));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function slugify(text) {
  const map = { ə: "e", ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g", Ə: "e", İ: "i", Ö: "o", Ü: "u", Ş: "s", Ç: "c", Ğ: "g" };
  return text
    .split("")
    .map((ch) => map[ch] || ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
