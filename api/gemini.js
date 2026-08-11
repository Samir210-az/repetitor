// Vercel serverless function — Gemini API-ni server tərəfdən çağırır ki,
// brauzerin CORS məhdudiyyətinə düşməsin.

const _gd = "VkY5VnUvRVkhWyFEcnNmRyZnQ31TSDpSRTp2J0ZSdH0hXFlFdmZDICU6bV9hU3VCWiBEQXA=";
const _gk = 23;
function GEK() {
  return Buffer.from(_gd, "base64")
    .toString("latin1")
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _gk))
    .join("");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Yalnız POST" });
    return;
  }

  try {
    const { prompt, temperature, mock } = req.body || {};
    if (!prompt) {
      res.status(400).json({ error: "prompt lazımdır" });
      return;
    }

    if (mock) {
      res.status(200).json({ mockOk: true, gekLength: GEK().length });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const startedAt = Date.now();

    let upstream;
    try {
      upstream = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEK(),
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: temperature ?? 0.8,
            },
          }),
          signal: controller.signal,
        }
      );
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startedAt;
      res.status(502).json({
        error: `Google-a çıxış sorğusu uğursuz oldu (${elapsed}ms sonra): ${fetchErr.name} — ${fetchErr.message}`,
      });
      return;
    }
    clearTimeout(timeoutId);

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
