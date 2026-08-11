// Embedded API access (eyni obfuscation üsulu)
const _gd = "VkY5VnUvRVkhWyFEcnNmRyZnQ31TSDpSRTp2J0ZSdH0hXFlFdmZDICU6bV9hU3VCWiBEQXA=";
const _gk = 23;
const GEK = () =>
  atob(_gd)
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _gk))
    .join("");

function buildCheckPrompt(fenn, sinif, suallar) {
  return `Sən Azərbaycan təhsil sistemi üzrə faktları yoxlayan ciddi bir redaktorsan. Aşağıda ${sinif}-ci sinif ${fenn} fənni üzrə hazırlanmış test sualları JSON formatında verilib.

VƏZİFƏN:
Hər sualı diqqətlə yoxla:
1. Sualda istifadə olunan hər hansı termin, əsər adı, tarixi fakt, düstur və ya hadisə REAL və DOĞRUDURMU? Uydurma/mövcud olmayan bir şey varsa (məs. mövcud olmayan dilçilik termini, olmayan əsər, səhv tarix, səhv düstur), o sualı TAM DƏYİŞ — eyni mövzuda, amma yalnız real və dəqiq faktlara əsaslanan yeni sualla əvəz et.
2. Düzgün cavab indeksinin ("duzgun") doğru olduğunu təsdiqlə, səhvdirsə düzəlt.
3. Sual mətnində məntiqi qeyri-müəyyənlik və ya birdən çox düzgün cavab ehtimalı varsa, sualı aydınlaşdır.
4. Dəyişməyə ehtiyac olmayan sualları OLDUĞU KİMİ saxla.

Sualların sayı və JSON strukturu DƏYİŞMƏMƏLİDİR — yalnız məzmun düzəlişi et.

JSON sualları:
${JSON.stringify(suallar)}

Yalnız düzəldilmiş tam JSON qaytar, başqa heç nə yazma (izah, markdown olmasın). Format:
{"suallar":[{"sual":"...","secimler":["...","...","...","..."],"duzgun":0}]}`;
}

export async function verifyWithGemini(fenn, sinif, suallar) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEK()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildCheckPrompt(fenn, sinif, suallar) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini xətası (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini cavabı JSON formatında deyil.");
  }
  if (!Array.isArray(parsed.suallar) || parsed.suallar.length === 0) {
    throw new Error("Gemini cavabında suallar tapılmadı.");
  }
  return parsed.suallar;
}
