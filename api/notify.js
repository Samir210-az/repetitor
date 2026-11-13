// Yeni qeydiyyat bildirişini serverdən Telegram-a göndərir.
// Env (Vercel -> Settings -> Environment Variables): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const hits = new Map();

function clean(v) {
  return String(v == null ? "" : v).replace(/[\u0000-\u0009\u000b-\u001f]/g, " ").trim().slice(0, 600);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const origin = req.headers.origin || "";
  if (!origin || origin !== `https://${req.headers.host}`) return res.status(403).json({ ok: false });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000);
  if (recent.length >= 5) return res.status(429).json({ ok: false });
  recent.push(now);
  hits.set(ip, recent);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ ok: false });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const text = clean(body.text);
  if (!text) return res.status(400).json({ ok: false });

  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
}
