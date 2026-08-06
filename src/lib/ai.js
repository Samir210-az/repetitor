// Embedded API access (digər layihələrdəki eyni üsul)
const _d = "dmJ6Tn8hJkNUekd3ZWRBJnJDJEAkIXVoRlZ1aHMiV0h3KWRWQlNYenljJlNoXHR4IydQJlJzZWI=";
const _k = 17;
const GK = () =>
  atob(_d)
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _k))
    .join("");

export async function generateTest({ fenn, sinif, sualSayi }) {
  const system = `Sən Azərbaycanda 20 illik təcrübəyə malik, MEB (Təhsil Nazirliyi) kurikulumunu əzbər bilən, dərsliklər üçün test yazan peşəkar müəllim-metodikstsən. Vəzifən — real məktəb/dərslik testlərinə tam bənzəyən suallar hazırlamaqdır, süni intellekt tərəfindən yazıldığı hiss olunmamalıdır.

QAYDALAR:
1. Suallar Azərbaycan Respublikası Təhsil Nazirliyinin həmin sinif üçün təsdiqlədiyi kurikulum mövzularına dəqiq uyğun olsun (mücərrəd, ümumi, xarici sistemlərə aid mövzulardan yox, məhz Azərbaycan dərsliklərindəki mövzulardan).
2. Sual üslubu real məktəb test kitabçalarındakı kimi təbii, qısa və birbaşa olsun. "Aşağıdakılardan hansı doğrudur?" kimi bir qəlibi təkrar-təkrar işlətmə — sual formalarını müxtəlifləşdir (tərif sualı, hesablama, tətbiq, müqayisə, səbəb-nəticə və s.).
3. Heç bir metadanışıq, izah, üzrxahlıq, "Qeyd:", "Aşağıda test verilmişdir:" kimi əlavə cümlə yazma — birbaşa suallara keç.
4. Səhv variantlar (distraktorlar) real, məntiqli səhv ehtimalları olsun (məs. hesablama xətası, oxşar termin qarışıqlığı) — açıq-aşkar gülünc və ya heç uyğun olmayan variantlar yazma.
5. Dil təbii Azərbaycan dilində, orfoqrafik və qrammatik cəhətdən qüsursuz olsun, tərcümə hissi verməsin.
6. Yalnız SAF JSON qaytar, başqa heç nə yazma (izah, markdown, kod bloku işarəsi olmasın). JSON formatı dəqiq belə olmalıdır:
{"suallar":[{"sual":"sual mətni","seçimler":["A variantı","B variantı","C variantı","D variantı"],"duzgun":0}]}
"duzgun" sahəsi 0-3 arası indeksdir (seçimlər array-indeksi), yalnız BİR düzgün cavab olmalıdır.`;

  const user = `Azərbaycan Təhsil Nazirliyinin ${sinif}-ci sinif kurikulumuna uyğun, ${fenn} fənni üzrə ${sualSayi} suallıq test hazırla. Hər sualın 4 cavab variantı olsun, yalnız biri düzgün. Real dərslik/test kitabçası səviyyəsində, təbii Azərbaycan dilində yaz.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GK()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 8000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI xətası (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.suallar) || parsed.suallar.length === 0) {
    throw new Error("AI cavabında suallar tapılmadı, yenidən sına.");
  }
  return parsed.suallar;
}
