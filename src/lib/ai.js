// Embedded API access (digər layihələrdəki eyni üsul)
const _d = "dmJ6Tn8hJkNUekd3ZWRBJnJDJEAkIXVoRlZ1aHMiV0h3KWRWQlNYenljJlNoXHR4IydQJlJzZWI=";
const _k = 17;
const GK = () =>
  atob(_d)
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _k))
    .join("");

function buildSystemPrompt(count) {
  return `Sən Azərbaycanda 20 illik təcrübəyə malik, MEB (Təhsil Nazirliyi) kurikulumunu əzbər bilən, dərsliklər üçün test yazan peşəkar müəllim-metodikstsən. Vəzifən — real məktəb/dərslik testlərinə tam bənzəyən suallar hazırlamaqdır, süni intellekt tərəfindən yazıldığı hiss olunmamalıdır.

QAYDALAR:
1. Suallar Azərbaycan Respublikası Təhsil Nazirliyinin həmin sinif üçün təsdiqlədiyi kurikulum mövzularına dəqiq uyğun olsun.
2. Sual üslubu real məktəb test kitabçalarındakı kimi təbii, qısa və birbaşa olsun. "Aşağıdakılardan hansı doğrudur?" kimi bir qəlibi təkrar-təkrar işlətmə — sual formalarını müxtəlifləşdir.
3. Heç bir metadanışıq, izah, üzrxahlıq, "Qeyd:" kimi əlavə cümlə yazma — birbaşa suallara keç.
4. Səhv variantlar real, məntiqli səhv ehtimalları olsun — açıq-aşkar gülünc variantlar yazma.
5. Dil təbii Azərbaycan dilində, orfoqrafik və qrammatik cəhətdən qüsursuz olsun.
6. ÇOX VACİB — SAY QAYDASI: Tam olaraq ${count} sual yaz. Nə bir dənə artıq, nə bir dənə əskik. Yazmadan əvvəl özün üçün sualları 1-dən ${count}-a qədər nömrələ və ${count}-cü sualdan sonra dərhal dayan, əlavə heç nə yazma.
7. Yalnız SAF JSON qaytar, başqa heç nə yazma (izah, markdown, kod bloku işarəsi olmasın). JSON formatı dəqiq belə olmalıdır:
{"suallar":[{"sual":"sual mətni","seçimler":["A variantı","B variantı","C variantı","D variantı"],"duzgun":0}]}
"suallar" array-i tam olaraq ${count} element daşımalıdır. "duzgun" sahəsi 0-3 arası indeksdir, yalnız BİR düzgün cavab olmalıdır.`;
}

async function callGroq(fenn, sinif, count, avoidNote) {
  const user = `Azərbaycan Təhsil Nazirliyinin ${sinif}-ci sinif kurikulumuna uyğun, ${fenn} fənni üzrə tam olaraq ${count} suallıq test hazırla. Hər sualın 4 cavab variantı olsun, yalnız biri düzgün. Real dərslik/test kitabçası səviyyəsində, təbii Azərbaycan dilində yaz.${avoidNote || ""}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GK()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildSystemPrompt(count) },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: Math.min(28000, count * 180 + 600),
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
  if (!Array.isArray(parsed.suallar)) return [];
  return parsed.suallar;
}

export async function generateTest({ fenn, sinif, sualSayi }) {
  const target = Number(sualSayi) || 60;
  let suallar = await callGroq(fenn, sinif, target);

  // Say uyğun gəlmirsə, çatışmayan qədər əlavə sorğu göndər (maksimum 3 cəhd)
  let attempts = 0;
  while (suallar.length < target && attempts < 3) {
    const missing = target - suallar.length;
    const avoidNote = ` Diqqət: bu, əvvəlki ${suallar.length} sualın DAVAMIDIR — mövzuları təkrarlamadan yeni ${missing} sual yaz.`;
    const extra = await callGroq(fenn, sinif, missing, avoidNote);
    suallar = suallar.concat(extra);
    attempts += 1;
  }

  if (suallar.length === 0) {
    throw new Error("AI cavabında suallar tapılmadı, yenidən sına.");
  }

  // Tam olaraq tələb olunan sayda kəs (artıq gələrsə kəsilir, azdırsa əldə olanla davam edir)
  return suallar.slice(0, target);
}
