import { GEK } from "./geminiCheck.js";

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
  const precisionNote = `\nDƏQİQLİK (bütün fənlərə aid, istisnasız): hər termin, qayda, tarix, düstur və ya cavab MEB rəsmi kurikulumuna və elmi cəhətdən 100% doğru olmalıdır. Yalnız RƏSMİ, tanınmış, real terminlərdən istifadə et — özündən heç bir termin, qayda adı və ya hadisə UYDURMA. Cavabı yazmazdan əvvəl özün üçün yoxla: "bu, həqiqətənmi belədir, real dilçilikdə/elmdə bu addanmı tanınır?" Əmin olmadığın heç nəyi yazma.`;

  if (cat === "dil") {
    return `Bu, DİL (qrammatika) fənnidir (${fenn}) — bu, ƏDƏBİYYAT DEYİL, ƏSƏR/ŞAİR/YAZIÇI SUALI YAZMA. Yalnız dilin öz qaydaları üzərində sual qur: orfoqrafiya, sintaksis, morfologiya, punktuasiya, fonetika, söz birləşmələri, nitq hissələri.
QƏTİ QADAĞAN NÜMUNƏLƏR: "X nədir?", "X neçə növə bölünür?" tipli sadə tərif sualı YAZMA.
Bunun əvəzinə hər sualda ƏN AZI biri olmalıdır: (a) verilmiş konkret cümlə üzərində qayda tətbiqi, (b) bir neçə qaydanın birləşdirilməsi, (c) səhv/düzgün variantlar arasında incə fərqin tapılması. Xarici dildirsə (İngilis/Rus/Alman/Fransız/Ərəb), o dilin qrammatikası və lüğəti üzərində eyni səviyyədə sual qur.${precisionNote}`;
  }
  if (cat === "edebiyyat") {
    return `Bu, ƏDƏBİYYAT fənnidir (${fenn}).
QƏTİ QADAĞAN NÜMUNƏLƏR: "Bu əsəri kim yazıb?", "Bu əsər nə vaxt yazılıb?", "Əsas mövzu nədir?" tipli sadə tərif sualı YAZMA.
Bunun əvəzinə hər sualda ƏN AZI biri olmalıdır: (a) iki əsər/obraz arasında müqayisə, (b) müəllifin mövqeyinin şərhi, (c) obrazın xarakterinin təhlili, (d) bədii vasitənin funksiyasının izahı. HEÇ VAXT mövcud olmayan əsər, obraz UYDURMA — yalnız real, tanınmış əsərlərdən istifadə et.${precisionNote}`;
  }
  if (cat === "humanitar") {
    return `Bu, humanitar fəndir (${fenn}).
QƏTİ QADAĞAN NÜMUNƏLƏR: "X nə vaxt baş verib?", "X kim idi?" tipli sadə əzbər sual YAZMA.
Bunun əvəzinə hər sualda ƏN AZI biri olmalıdır: (a) səbəb-nəticə təhlili, (b) iki hadisə/dövr müqayisəsi, (c) verilmiş məlumat üzərində tətbiq, (d) fərqli baxışların qarşılaşdırılması. HEÇ VAXT mövcud olmayan hadisə UYDURMA.${precisionNote}`;
  }
  return `Bu, dəqiq/təbiət elmi fənnidir (${fenn}). QƏTİ QADAĞAN NÜMUNƏLƏR: "X nədir?", "X-in tərkibi/növləri/funksiyaları hansılardır?" — bunlar DİM səviyyəsi DEYİL.
Bunun əvəzinə hər sualda ƏN AZI biri olmalıdır: (a) ƏDƏDİ HESABLAMA (molyar kütlə, faiz, tənlik balanslaşdırması, stoxiometrik hesablama və s. — konkret ƏDƏDLƏRLƏ), (b) çoxaddımlı məntiqi zəncir, (c) iki anlayışın birləşdirilməsi. Dar mövzuda belə çətinlik aşağı düşməməlidir. HESABLAMANI ADDIM-ADDIM YOXLA — "duzgun" indeksi riyazi cəhətdən dəqiq doğru olsun.${precisionNote}`;
}

function buildSystemPrompt(count, fenn, sinif, movzular) {
  const topicScope = movzular
    ? `\n\nMÖVZU MƏHDUDİYYƏTİ (ÇOX VACİB): Repetitor yalnız bu mövzuları keçib: "${movzular}". YALNIZ bu mövzulardan sual yaz.`
    : "";

  return `Sən Azərbaycanda 20 illik təcrübəyə malik, DİM (Dövlət İmtahan Mərkəzi) formatında abituriyent hazırlığı testləri yazan peşəkar müəllim-metodikstsən. ${sinif}-ci sinif ${fenn} fənni üzrə test hazırlayırsan, süni intellekt tərəfindən yazıldığı hiss olunmamalıdır.

QAYDALAR:
1. Bu testlər 8, 9, 10 və 11-ci siniflər üçündür, DİM/abituriyent hazırlığı SƏVİYYƏSİNDƏ olmalıdır.
2. ${difficultyRule(fenn)}${topicScope}
3. ÇOX VACİB — TƏKRAR QADAĞASI: Hər sualın həm sualı, həm 4 cavab variantı TAM UNİKAL olmalıdır. Eyni cavab variantları dəstini başqa sualda təkrar İŞLƏTMƏ. Eyni sözü/cümləni fərqli suallarda nümunə kimi təkrar-təkrar istifadə etmə.
3.1. ÇOX VACİB — İFADƏ MÜXTƏLİFLİYİ: Sualların BAŞLANĞIC İFADƏSİ də müxtəlif olmalıdır. "Aşağıdakı cümlələrdən hansında..." kimi bir qəlibi bütün ${count} sual boyu təkrar-təkrar İŞLƏTMƏ — bu, açıq-aşkar süni (AI) görünüş yaradır. ${count} sualın içində bu tip başlanğıclardan HƏR BİRİNİ ƏN ÇOX 2-3 DƏFƏ işlət, qalanları fərqli formalarla qur, məsələn: "...sözü/termini nə deməkdir?", "Verilmiş nümunədə...", "...ilə bağlı hansı fikir doğrudur?", "Əgər ... olarsa, onda...", "...ilə ... arasındakı fərq nədir?", birbaşa hesablama/tapşırıq forması, mətn parçası üzərində sual və s. Hər 3-4 sualdan sonra mütləq fərqli bir başlanğıc forması istifadə et.
4. Səhv variantlar real, məntiqli olsun, gülünc olmasın.
5. Dil təbii Azərbaycan dilində, orfoqrafik və qrammatik cəhətdən qüsursuz olsun.
6. ÇOX VACİB — SAY QAYDASI: Tam olaraq ${count} sual yaz. Nə bir dənə artıq, nə əskik.
7. ÇOX VACİB — FORMAT: "secimler" massivindəki hər variant YALNIZ təmiz mətn olsun, əvvəlinə "A)" kimi heç nə əlavə etmə.
8. Yalnız SAF JSON qaytar, başqa heç nə yazma:
{"suallar":[{"sual":"sual mətni","secimler":["variant","variant","variant","variant"],"duzgun":0}]}
"suallar" array-i tam olaraq ${count} element daşımalıdır. "duzgun" 0-3 arası indeksdir, yalnız BİR düzgün cavab.`;
}

function stripOptionPrefix(text) {
  if (typeof text !== "string") return text;
  return text.replace(/^\s*[A-D]\s*[).:-]\s*/i, "").trim();
}

async function callGemini(fenn, sinif, count, movzular, priorSuallar) {
  const priorNote =
    priorSuallar && priorSuallar.length > 0
      ? `\n\nBUNLAR ARTIQ YAZILIB — eyni sual/variantları TƏKRARLAMA, tam fərqli, yeni ${count} sual yaz:\n${JSON.stringify(priorSuallar.map((q) => ({ sual: q.sual, secimler: q.secimler })))}`
      : "";

  const prompt = buildSystemPrompt(count, fenn, sinif, movzular) + priorNote;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEK()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI xətası (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI cavabı JSON formatında deyil: ${cleaned.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed.suallar)) {
    throw new Error(`AI cavabında "suallar" array-i yoxdur.`);
  }

  return parsed.suallar.map((q) => ({
    ...q,
    secimler: Array.isArray(q.secimler) ? q.secimler.map(stripOptionPrefix) : q.secimler,
    sual: typeof q.sual === "string" ? q.sual.trim() : q.sual,
  }));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const BATCH_SIZE = 8;

export async function generateTest({ fenn, sinif, sualSayi, movzular, onProgress }) {
  const target = Number(sualSayi) || 60;
  let suallar = [];
  let attempts = 0;
  let lastError = null;
  const maxAttempts = Math.ceil(target / BATCH_SIZE) + 20;

  while (suallar.length < target && attempts < maxAttempts) {
    const remaining = target - suallar.length;
    const batch = Math.min(BATCH_SIZE, remaining);
    try {
      const extra = await callGemini(fenn, sinif, batch, movzular, suallar);
      suallar = suallar.concat(extra);
      if (onProgress) onProgress(suallar.length, target);
    } catch (err) {
      lastError = err;
      if (String(err.message).includes("429") || String(err.message).includes("503")) {
        await sleep(3000);
      }
    }
    attempts += 1;
    if (suallar.length < target) await sleep(500);
  }

  if (suallar.length === 0) {
    throw lastError || new Error("AI cavabında suallar tapılmadı, yenidən sına.");
  }

  return suallar.slice(0, target);
}
