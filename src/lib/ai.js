import { verifyWithGemini } from "./geminiCheck.js";

// Embedded API access (digər layihələrdəki eyni üsul)
const _d = "dmJ6Tn8hJkNUekd3ZWRBJnJDJEAkIXVoRlZ1aHMiV0h3KWRWQlNYenljJlNoXHR4IydQJlJzZWI=";
const _k = 17;
const GK = () =>
  atob(_d)
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _k))
    .join("");

const BATCH_SIZE = 8;

const LITERATURE_KEYWORDS = ["ədəbiyyat", "literature"];
const LANGUAGE_KEYWORDS = ["dil", "language"];
const OTHER_HUMANITIES_KEYWORDS = [
  "tarix", "coğrafiya", "fəlsəfə", "hüquq", "din", "cəmiyyət",
];

function subjectCategory(fenn) {
  const f = (fenn || "").toLowerCase();
  if (LITERATURE_KEYWORDS.some((k) => f.includes(k))) return "edebiyyat";
  if (LANGUAGE_KEYWORDS.some((k) => f.includes(k))) return "dil";
  if (OTHER_HUMANITIES_KEYWORDS.some((k) => f.includes(k))) return "humanitar";
  return "stem";
}

function difficultyRule(fenn) {
  const cat = subjectCategory(fenn);

  if (cat === "dil") {
    return `Bu, DİL (qrammatika) fənnidir (${fenn}) — bu, ƏDƏBİYYAT DEYİL, ƏSƏR/ŞAİR/YAZIÇI SUALI YAZMA. Yalnız dilin öz qaydaları üzərində sual qur: orfoqrafiya (yazı qaydaları), sintaksis (cümlə quruluşu), morfologiya (söz növləri, şəkilçilər), punktuasiya (durğu işarələri), fonetika (səs, hərf), söz birləşmələri, nitq hissələri, sözlərin düzgün işlədilməsi. Əgər fənn xarici dildirsə (İngilis/Rus/Alman/Fransız/Ərəb dili), o dilin öz qrammatikası, lüğəti və cümlə qurluşu üzərində sual qur. Heç bir halda ədəbi əsərin məzmunu, müəllifi və ya qəhrəmanları haqqında sual YAZMA.`;
  }
  if (cat === "edebiyyat") {
    return `Bu, ƏDƏBİYYAT fənnidir (${fenn}). Çətinliyi DƏRİNLİK yolu ilə qur: mətn təhlili, müəllif fikrinin şərhi, iki əsər arasında müqayisə, obrazın xarakteri, əsərin ideyası. Sadə "kim yazıb / nə vaxt olub" tipli əzbər sual yazma, amma HEÇ VAXT mövcud olmayan əsər, obraz və ya "fakt" UYDURMA — yalnız real, tanınmış, məktəb dərsliklərində keçən əsərlərdən istifadə et. Eyni əsəri/obrazı dəfələrlə təkrarlama, müxtəlif əsərlərdən sual qur.`;
  }
  if (cat === "humanitar") {
    return `Bu, humanitar fəndir (${fenn}). Çətinliyi DƏRİNLİK yolu ilə qur: hadisələrin təhlili, səbəb-nəticə əlaqəsi, müqayisə, qaydanın konkret nümunə üzərində tətbiqi. Sadə əzbər sual yazma, amma HEÇ VAXT mövcud olmayan hadisə, tarix və ya "fakt" UYDURMA — yalnız real, tanınmış, məktəb dərsliklərində keçən məzmundan istifadə et.`;
  }
  return `Bu, dəqiq/təbiət elmi fənnidir (${fenn}). QƏTİ QADAĞAN NÜMUNƏLƏR (bu tip sual YAZMA): "X nədir?", "X-in tərkibində hansı elementlər var?", "X neçə növə bölünür?", "X-in funksiyaları hansılardır?" — bunlar sadə tərif sualıdır, DİM səviyyəsi DEYİL.
Bunun əvəzinə hər sualda ƏN AZI biri olmalıdır: (a) ƏDƏDİ HESABLAMA (molyar kütlə, faiz tərkibi, kimyəvi tənliyin balanslaşdırılması, stoxiometrik hesablama, məsafə/sürət/qüvvə hesabı və s. — konkret ƏDƏDLƏRLƏ), (b) çoxaddımlı məntiqi zəncir (bir neyi tapmaq üçün əvvəlcə başqa bir şeyi tapmaq lazımdır), (c) iki və ya daha çox anlayışın birləşdirilməsi (məs. bir mövzunun formulunu başqa mövzunun konsepti ilə birləşdirmək). MÖVZU nə qədər dar olsa da (məsələn tək bir mövzu — "Zülallar" kimi), çətinlik SƏVİYYƏSİ HEÇ VAXT aşağı düşməməlidir — dar mövzu daxilində hesablama/analiz variantları tap (məs. Zülallar mövzusunda: amin turşusu sayından molekul kütləsini hesabla, hidroliz tənliyini balanslaşdır, peptid rabitəsi sayını hesabla və s.). Şagird sualı birbaşa dərslikdən "tanıyıb" cavablandıra bilməməlidir — özü addım-addım hesablayıb həll etməlidir.`;
}

function buildSystemPrompt(count, fenn, movzular) {
  const topicScope = movzular
    ? `\n\nMÖVZU MƏHDUDİYYƏTİ (ÇOX VACİB): Repetitor yalnız bu mövzuları keçib: "${movzular}". YALNIZ bu mövzulardan sual yaz. Bu siyahıda olmayan mövzudan sual YAZMA, hətta kurikuluma aid olsa belə.`
    : "";

  return `Sən Azərbaycanda 20 illik təcrübəyə malik, DİM (Dövlət İmtahan Mərkəzi) formatında abituriyent hazırlığı testləri yazan peşəkar müəllim-metodikstsən. Vəzifən — real DİM test kitabçalarına tam bənzəyən, yüksək çətinlikli suallar hazırlamaqdır, süni intellekt tərəfindən yazıldığı hiss olunmamalıdır.

QAYDALAR:
1. Bu testlər 8, 9, 10 və 11-ci siniflər üçündür — DİM (Dövlət İmtahan Mərkəzi) / abituriyent hazırlığı SƏVİYYƏSİNDƏ olmalıdır. Sadə əzbər sualları YAZMA.
2. ${difficultyRule(fenn)}
3. ÇOX VACİB — UYDURMA QADAĞASI: Əgər hər hansı fakt, tarix, əsər adı, termin, düstur və ya hadisədən TAM ƏMİN DEYİLSƏNSƏ, onu İŞLƏTMƏ. Uydurma/mövcud olmayan termin, əsər, hadisə yazmaqdansa, o sualı YAZMA və əvəzinə əmin olduğun başqa bir alt-mövzudan sual qur. Dəqiqlik həmişə çətinlikdən üstündür.
4. Suallar Azərbaycan Respublikası Təhsil Nazirliyinin həmin sinif üçün təsdiqlədiyi kurikulum mövzularına dəqiq uyğun olsun.${topicScope}
5. Sual üslubu real DİM/abituriyent test kitabçalarındakı kimi təbii, dəqiq və birbaşa olsun. "Aşağıdakılardan hansı doğrudur?" kimi bir qəlibi təkrar-təkrar işlətmə — sual formalarını müxtəlifləşdir.
6. Səhv variantlar real, məntiqli səhv ehtimalları olsun, açıq-aşkar gülünc olmasın.
7. Dil təbii Azərbaycan dilində, orfoqrafik və qrammatik cəhətdən qüsursuz olsun.
8. ÇOX VACİB — FORMAT QAYDASI: "secimler" massivindəki HƏR bir variant YALNIZ təmiz mətn olsun. Variantın əvvəlinə "A)", "B)", "1.", "-" kimi heç bir hərf/rəqəm/işarə ƏLAVƏ ETMƏ — bunu sistem özü avtomatik əlavə edəcək. Səhv nümunə: "A) Bakı" — DOĞRU nümunə: "Bakı".
9. ÇOX VACİB — SAY QAYDASI: Tam olaraq ${count} sual yaz. Nə bir dənə artıq, nə bir dənə əskik.
10. Yalnız SAF JSON qaytar, başqa heç nə yazma. JSON formatı dəqiq belə olmalıdır:
{"suallar":[{"sual":"sual mətni","secimler":["variant mətni","variant mətni","variant mətni","variant mətni"],"duzgun":0}]}
"suallar" array-i tam olaraq ${count} element daşımalıdır. "duzgun" sahəsi 0-3 arası indeksdir, yalnız BİR düzgün cavab olmalıdır.`;
}

// Ehtiyat təhlükəsizlik: AI hər ehtimala qarşı "A) " kimi prefiks qoysa, təmizlə
function stripOptionPrefix(text) {
  if (typeof text !== "string") return text;
  return text.replace(/^\s*[A-DA-Dа-г]\s*[).:-]\s*/i, "").trim();
}

async function callGroq(fenn, sinif, count, movzular, avoidNote) {
  const user = `Azərbaycan Təhsil Nazirliyinin ${sinif}-ci sinif kurikulumuna uyğun, ${fenn} fənni üzrə DİM (abituriyent) səviyyəsində tam olaraq ${count} suallıq test hazırla. Hər sualın 4 cavab variantı olsun, yalnız biri düzgün. Təbii Azərbaycan dilində yaz.${avoidNote || ""}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GK()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildSystemPrompt(count, fenn, movzular) },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: Math.min(6000, count * 220 + 500),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI xətası (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const withoutThink = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const cleaned = withoutThink.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI cavabı düzgün JSON formatında deyil: ${cleaned.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed.suallar)) {
    throw new Error(`AI cavabında "suallar" array-i yoxdur: ${cleaned.slice(0, 200)}`);
  }

  // Təmizləmə: hər ehtimala qarşı prefiksləri sil
  return parsed.suallar.map((q) => ({
    ...q,
    secimler: Array.isArray(q.secimler) ? q.secimler.map(stripOptionPrefix) : q.secimler,
    sual: typeof q.sual === "string" ? q.sual.trim() : q.sual,
  }));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function generateTest({ fenn, sinif, sualSayi, movzular, onProgress, onStage }) {
  const target = Number(sualSayi) || 60;
  let suallar = [];
  let attempts = 0;
  let lastError = null;
  const maxAttempts = Math.ceil(target / BATCH_SIZE) + 20;

  while (suallar.length < target && attempts < maxAttempts) {
    const remaining = target - suallar.length;
    const batch = Math.min(BATCH_SIZE, remaining);
    const avoidNote =
      suallar.length > 0
        ? ` Diqqət: bu, əvvəlki ${suallar.length} sualın DAVAMIDIR — mövzuları təkrarlamadan yeni ${batch} sual yaz.`
        : "";
    try {
      const extra = await callGroq(fenn, sinif, batch, movzular, avoidNote);
      suallar = suallar.concat(extra);
      if (onProgress) onProgress(suallar.length, target);
    } catch (err) {
      lastError = err;
      if (String(err.message).includes("429") || String(err.message).includes("413")) {
        await sleep(2500);
      }
    }
    attempts += 1;
    if (suallar.length < target) await sleep(500);
  }

  if (suallar.length === 0) {
    throw lastError || new Error("AI cavabında suallar tapılmadı, yenidən sına.");
  }

  const finalSuallar = suallar.slice(0, target);

  // 2-ci qat: Gemini ilə fakt-yoxlama (uğursuz olsa, orijinal nəticə qalır — test bloklanmır)
  if (onStage) onStage("checking");
  try {
    const checked = await verifyWithGemini(fenn, sinif, finalSuallar);
    if (Array.isArray(checked) && checked.length === finalSuallar.length) {
      return checked.map((q) => ({
        ...q,
        secimler: Array.isArray(q.secimler) ? q.secimler.map(stripOptionPrefix) : q.secimler,
      }));
    }
  } catch {
    // Gemini əlçatan deyilsə və ya xəta versə, Groq nəticəsi ilə davam et
  }

  return finalSuallar;
}
