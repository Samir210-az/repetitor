// Embedded API access (digər layihələrdəki eyni üsul)
const _d = "dmJ6Tn8hJkNUekd3ZWRBJnJDJEAkIXVoRlZ1aHMiV0h3KWRWQlNYenljJlNoXHR4IydQJlJzZWI=";
const _k = 17;
const GK = () =>
  atob(_d)
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _k))
    .join("");

const BATCH_SIZE = 12; // TPM limitinə görə hər sorğuda maksimum bu qədər sual istənir

function buildSystemPrompt(count) {
  return `Sən Azərbaycanda 20 illik təcrübəyə malik, MEB (Təhsil Nazirliyi) kurikulumunu əzbər bilən, dərsliklər üçün test yazan peşəkar müəllim-metodikstsən. Vəzifən — real məktəb/dərslik testlərinə tam bənzəyən suallar hazırlamaqdır, süni intellekt tərəfindən yazıldığı hiss olunmamalıdır.

QAYDALAR:
1. Suallar Azərbaycan Respublikası Təhsil Nazirliyinin həmin sinif üçün təsdiqlədiyi kurikulum mövzularına dəqiq uyğun olsun.
2. Sual üslubu real məktəb test kitabçalarındakı kimi təbii, qısa və birbaşa olsun. "Aşağıdakılardan hansı doğrudur?" kimi bir qəlibi təkrar-təkrar işlətmə — sual formalarını müxtəlifləşdir.
3. Heç bir metadanışıq, izah, üzrxahlıq, "Qeyd:" kimi əlavə cümlə yazma — birbaşa suallara keç.
4. Səhv variantlar real, məntiqli səhv ehtimalları olsun — açıq-aşkar gülünc variantlar yazma.
5. Dil təbii Azərbaycan dilində, orfoqrafik və qrammatik cəhətdən qüsursuz olsun.
6. ÇOX VACİB — SAY QAYDASI: Tam olaraq ${count} sual yaz. Nə bir dənə artıq, nə bir dənə əskik.
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
      max_tokens: Math.min(6000, count * 200 + 500),
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function generateTest({ fenn, sinif, sualSayi, onProgress }) {
  const target = Number(sualSayi) || 60;
  let suallar = [];
  let attempts = 0;
  const maxAttempts = Math.ceil(target / BATCH_SIZE) + 3;

  while (suallar.length < target && attempts < maxAttempts) {
    const remaining = target - suallar.length;
    const batch = Math.min(BATCH_SIZE, remaining);
    const avoidNote =
      suallar.length > 0
        ? ` Diqqət: bu, əvvəlki ${suallar.length} sualın DAVAMIDIR — mövzuları təkrarlamadan yeni ${batch} sual yaz.`
        : "";
    try {
      const extra = await callGroq(fenn, sinif, batch, avoidNote);
      suallar = suallar.concat(extra);
      if (onProgress) onProgress(suallar.length, target);
    } catch (err) {
      // TPM limitinə dəysə, bir az gözləyib yenidən sına
      if (String(err.message).includes("429") || String(err.message).includes("413")) {
        await sleep(2500);
      } else if (suallar.length === 0 && attempts === maxAttempts - 1) {
        throw err;
      }
    }
    attempts += 1;
    if (suallar.length < target) await sleep(600); // ardıcıl sorğular arası kiçik fasilə (TPM üçün)
  }

  if (suallar.length === 0) {
    throw new Error("AI cavabında suallar tapılmadı, yenidən sına.");
  }

  return suallar.slice(0, target);
}
