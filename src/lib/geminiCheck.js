// Embedded API access (eyni obfuscation üsulu)
const _gd = "VkY5VnUvRVkhWyFEcnNmRyZnQ31TSDpSRTp2J0ZSdH0hXFlFdmZDICU6bV9hU3VCWiBEQXA=";
const _gk = 23;
export const GEK = () =>
  atob(_gd)
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _gk))
    .join("");

function buildCheckPrompt(fenn, sinif, suallar) {
  return `Sən Azərbaycan təhsil sistemi üzrə faktları yoxlayan ciddi bir redaktorsan. Aşağıda ${sinif}-ci sinif ${fenn} fənni üzrə hazırlanmış test sualları JSON formatında verilib.

VƏZİFƏN:
Hər sualı diqqətlə yoxla:
0. FƏN SƏRHƏDİ (ÇOX VACİB): "${fenn}" fənninin növünü müəyyən et. Əgər bu DİL (qrammatika) fənnidirsə (Ana dili, Azərbaycan dili, İngilis dili və s.), suallar YALNIZ qrammatika/orfoqrafiya/sintaksis/morfologiya/lüğət üzərində olmalıdır — əgər hər hansı sual ədəbi əsər, şair, yazıçı və ya əsərin məzmunu haqqındadırsa (yəni ƏDƏBİYYAT fənninə aiddir, DİL fənninə yox), bu, SƏHV FƏNDƏNDİR — sualı TAM DƏYİŞ, əvəzinə real qrammatika sualı yaz. Əksinə, əgər fənn ƏDƏBİYYAT-dırsa, suallar əsərlərin təhlili üzərində olmalıdır, sadəcə qrammatika sualı olmamalıdır.
0.5. ÇƏTİNLİK SƏVİYYƏSİ (ÇOX VACİB, əgər ${fenn} dəqiq/təbiət elmi fənnidirsə — Riyaziyyat, Kimya, Fizika, Biologiya): Hər sualı yoxla — əgər sual sadəcə "X nədir?", "X-in tərkibi/növləri/funksiyaları hansılardır?" tipli tərif sualıdırsa (ədədi hesablama, düstur tətbiqi və ya çoxaddımlı məntiq TƏLƏB ETMİRSƏ), bu, DİM səviyyəsi üçün ÇOX SADƏDİR — sualı TAM DƏYİŞ, eyni mövzuda amma hesablama/çoxaddımlı analiz tələb edən yeni sualla əvəz et (məs. molyar kütlə hesabı, tənlik balanslaşdırması, faiz tərkibi, stoxiometrik hesablama).
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEK()}`,
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
