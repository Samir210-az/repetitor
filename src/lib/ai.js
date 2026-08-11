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
Bunun əvəzinə hər sualda ƏN AZI biri olmalıdır: (a) verilmiş konkret cümlə üzərində qayda tətbiqi, (b) bir neçə qaydanın birləşdirilməsi, (c) səhv/düzgün variantlar arasında incə fərqin tapılması. Xarici dildirsə (İngilis/Rus/Alman/Fransız/Ərəb), o dilin qrammatikası və lüğəti üzərində eyni səviyyədə sual qur. Yalnız RƏSMİ, tanınmış qrammatik terminlərdən istifadə et — özündən termin uydurma.${precisionNote}`;
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

function fewShotExample(fenn) {
  const cat = subjectCategory(fenn);
  if (cat === "dil") {
    return `\n\nNÜMUNƏ (bu SƏVİYYƏDƏ və FORMATDA yaz, məzmununu təkrarlama):
{"sual":"'Kitabxanaçı' sözü hansı yolla əmələ gəlib?","secimler":["Sadə söz","Düzəltmə söz (şəkilçi ilə)","Mürəkkəb söz","Cüt söz"],"duzgun":1}`;
  }
  if (cat === "edebiyyat") {
    return `\n\nNÜMUNƏ (bu SƏVİYYƏDƏ və FORMATDA yaz, məzmununu təkrarlama):
{"sual":"Klassisizm və Romantizm ədəbi cərəyanları arasındakı əsas fərq nədə idi?","secimler":["Klassisizm hissi, Romantizm ağlı önə çıxarırdı","Klassisizm qayda-qanuna, Romantizm fərdi hisslərə üstünlük verirdi","Hər ikisi eyni prinsiplərə əsaslanırdı","Romantizm daha qədim cərəyan idi"],"duzgun":1}`;
  }
  if (cat === "humanitar") {
    return `\n\nNÜMUNƏ (bu SƏVİYYƏDƏ və FORMATDA yaz, məzmununu təkrarlama):
{"sual":"Sənaye inqilabının Avropada məhz İngiltərədən başlamasının əsas səbəbi nə idi?","secimler":["Kömür və dəmir ehtiyatlarının bolluğu, kapital və texniki yeniliklərin birləşməsi","Yalnız coğrafi mövqeyin əlverişliliyi","Əhalinin digər ölkələrdən çox olması","Hökumətin xarici ticarəti qadağan etməsi"],"duzgun":0}`;
  }
  return `\n\nNÜMUNƏ (bu SƏVİYYƏDƏ və FORMATDA yaz, məzmununu təkrarlama):
{"sual":"Maqnezium hidroksidin [Mg(OH)₂] tərkibindəki maqneziumun kütlə payı neçə faizdir? (Ar: Mg=24, O=16, H=1)","secimler":["41,4%","27,6%","58,6%","34,5%"],"duzgun":0}`;
}

function buildSystemPrompt(count, fenn, sinif, movzular) {
  const topicScope = movzular
    ? `\n\nMÖVZU MƏHDUDİYYƏTİ (ÇOX VACİB): Repetitor yalnız bu mövzuları keçib: "${movzular}". YALNIZ bu mövzulardan sual yaz.`
    : `\n\nMÖVZU MÜXTƏLİFLİYİ (ÇOX VACİB): Repetitor konkret mövzu təyin etməyib — sən ${sinif}-ci sinif ${fenn} fənninin BÜTÜN kurikulumunu illərdir öyrədən təcrübəli bir müəllim kimi davran. ${count} sualı TƏK BİR MÖVZU/HESABLAMA NÖVÜ üzərində YAZMA (məs. hamısını "molyar kütlə hesabı" üzərində qurmaq YANLIŞDIR) — real müəllim kimi kurikulumun MÜXTƏLİF bölmələrindən (fərqli mövzu başlıqlarından) sual seç ki, test real hazırlıq imtahanı kimi hərtərəfli olsun. ${count} sual ən azı ${Math.max(3, Math.min(8, Math.ceil(count / 4)))} fərqli mövzu/bölmə arasında bölünsün.`;

  return `Sən Azərbaycanda 20 illik təcrübəyə malik, DİM (Dövlət İmtahan Mərkəzi) formatında abituriyent hazırlığı testləri yazan peşəkar müəllim-metodikstsən. ${sinif}-ci sinif ${fenn} fənni üzrə test hazırlayırsan, süni intellekt tərəfindən yazıldığı hiss olunmamalıdır — sən özünü illərdir bu fənni tədris edən, kurikulumun hər guşəsini yaxşı bilən real bir repetitor kimi apar.

ÇOX VACİB — İŞ ÜSULUN (real müəllim kimi): Sualları yazmazdan ƏVVƏL, öz zehnində (bunu YAZMA, sadəcə daxili olaraq planlaşdır) ${sinif}-ci sinif ${fenn} kurikulumunun 6-10 əsas mövzu/bölmə başlığını sadala və ${count} sualını bu bölmələr arasında ağıllı şəkildə bölüşdür — məhz real bir repetitorun kağız üzərində test tərtib etməzdən əvvəl etdiyi kimi. Yalnız bundan sonra faktiki sualları yaz. Cavabında YALNIZ yekun JSON olsun, planını göstərmə.

QAYDALAR:
1. Bu testlər 8, 9, 10 və 11-ci siniflər üçündür, DİM/abituriyent hazırlığı SƏVİYYƏSİNDƏ olmalıdır.
2. ${difficultyRule(fenn)}${topicScope}
3. ÇOX VACİB — TƏKRAR QADAĞASI: Hər sualın həm sualı, həm 4 cavab variantı TAM UNİKAL olmalıdır. Eyni cavab variantları dəstini başqa sualda təkrar İŞLƏTMƏ. Eyni sözü/cümləni fərqli suallarda nümunə kimi təkrar-təkrar istifadə etmə.
3.1. ÇOX VACİB — İFADƏ MÜXTƏLİFLİYİ: Sualların BAŞLANĞIC İFADƏSİ də müxtəlif olmalıdır. "Aşağıdakı cümlələrdən hansında..." kimi bir qəlibi bütün ${count} sual boyu təkrar-təkrar İŞLƏTMƏ. ${count} sualın içində bu tip başlanğıclardan HƏR BİRİNİ ƏN ÇOX 2-3 DƏFƏ işlət, qalanları fərqli formalarla qur.
4. Səhv variantlar real, məntiqli olsun, gülünc olmasın.
5. Dil təbii Azərbaycan dilində, orfoqrafik və qrammatik cəhətdən qüsursuz olsun.
6. ÇOX VACİB — SAY QAYDASI: Tam olaraq ${count} sual yaz. Nə bir dənə artıq, nə əskik.
7. ÇOX VACİB — FORMAT: "secimler" massivindəki hər variant YALNIZ təmiz mətn olsun, əvvəlinə "A)" kimi heç nə əlavə etmə.
8. Yalnız SAF JSON qaytar, başqa heç nə yazma. Format:
{"suallar":[{"sual":"sual mətni","secimler":["variant","variant","variant","variant"],"duzgun":0}]}
"suallar" array-i tam olaraq ${count} element daşımalıdır. "duzgun" 0-3 arası indeksdir, yalnız BİR düzgün cavab.${fewShotExample(fenn)}`;
}

function stripOptionPrefix(text) {
  if (typeof text !== "string") return text;
  return text.replace(/^\s*[A-D]\s*[).:-]\s*/i, "").trim();
}

// Embedded API access
const _d = "dmJ6Tn8hJkNUekd3ZWRBJnJDJEAkIXVoRlZ1aHMiV0h3KWRWQlNYenljJlNoXHR4IydQJlJzZWI=";
const _k = 17;
const GK = () =>
  atob(_d)
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ _k))
    .join("");

async function callGroq(fenn, sinif, count, movzular, priorSuallar) {
  const priorNote =
    priorSuallar && priorSuallar.length > 0
      ? `\n\nBUNLAR ARTIQ YAZILIB — eyni sual/variantları TƏKRARLAMA, tam fərqli, yeni ${count} sual yaz:\n${JSON.stringify(priorSuallar.map((q) => ({ sual: q.sual, secimler: q.secimler })))}`
      : "";

  const user = `Azərbaycan Təhsil Nazirliyinin ${sinif}-ci sinif kurikulumuna uyğun, ${fenn} fənni üzrə DİM (abituriyent) səviyyəsində tam olaraq ${count} suallıq test hazırla. Hər sualın 4 cavab variantı olsun, yalnız biri düzgün. Təbii Azərbaycan dilində yaz.${priorNote}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GK()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: buildSystemPrompt(count, fenn, sinif, movzular) },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
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

function buildCritiquePrompt(fenn, sinif, suallar) {
  return `Sən ciddi, tənqidi bir metodik-redaktorsan. Aşağıda ${sinif}-ci sinif ${fenn} fənni üzrə hazırlanmış test sualları JSON formatında verilib. Hər sualı diqqətlə yoxla:
1. UYDURMA yoxla: mövcud olmayan termin, əsər, fakt, tarix, düstur varmı? Varsa, o sualı TAM DƏYİŞ (eyni mövzuda, real fakta əsaslanan yeni sualla əvəz et).
2. TƏKRAR yoxla: eyni cavab variantları, eyni sual başlanğıcı çox təkrarlanırmı? Varsa, təkrarlanan sualları dəyişdirib müxtəflifləşdir.
3. SƏVİYYƏ yoxla: hər hansı sual həddindən artıq sadə (yalnız "X nədir?" tipli əzbər) sualdırmı? Varsa, DİM səviyyəsinə uyğun çətinləşdir (hesablama/təhlil/müqayisə tələb etsin).
4. Düzgün cavab indeksinin ("duzgun") doğru olduğunu təsdiqlə, səhvdirsə düzəlt.
Dəyişməyə ehtiyac olmayan güclü sualları OLDUĞU KİMİ saxla — hər şeyi dəyişmə, yalnız zəif olanları.

Sualların sayı və JSON strukturu DƏYİŞMƏMƏLİDİR.

Sullar:
${JSON.stringify(suallar)}

Yalnız düzəldilmiş tam JSON qaytar, başqa heç nə yazma. Format:
{"suallar":[{"sual":"...","secimler":["...","...","...","..."],"duzgun":0}]}`;
}

async function critiqueAndFix(fenn, sinif, suallar) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GK()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildCritiquePrompt(fenn, sinif, suallar) }],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: Math.min(8000, suallar.length * 250 + 800),
    }),
  });

  if (!res.ok) throw new Error(`Tənqid mərhələsi uğursuz (${res.status})`);

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.suallar) || parsed.suallar.length !== suallar.length) {
    throw new Error("Tənqid mərhələsi say uyğunsuzluğu");
  }
  return parsed.suallar.map((q) => ({
    ...q,
    secimler: Array.isArray(q.secimler) ? q.secimler.map(stripOptionPrefix) : q.secimler,
    sual: typeof q.sual === "string" ? q.sual.trim() : q.sual,
  }));
}

export async function generateTest({ fenn, sinif, sualSayi, movzular, onProgress, onStage }) {
  const target = Number(sualSayi) || 60;
  let suallar = [];
  let attempts = 0;
  let consecutiveFailures = 0;
  let lastError = null;
  const maxAttempts = Math.ceil(target / BATCH_SIZE) + 6;

  while (suallar.length < target && attempts < maxAttempts) {
    const remaining = target - suallar.length;
    const batch = Math.min(BATCH_SIZE, remaining);
    try {
      const extra = await callGroq(fenn, sinif, batch, movzular, suallar);
      suallar = suallar.concat(extra);
      consecutiveFailures = 0;
      if (onProgress) onProgress(suallar.length, target);
    } catch (err) {
      lastError = err;
      consecutiveFailures += 1;
      if (consecutiveFailures >= 3) break;
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

  // Özünü tənqid mərhələsi — uğursuz olsa, orijinal nəticə ilə davam et (test bloklanmır)
  if (onStage) onStage("checking");
  try {
    return await critiqueAndFix(fenn, sinif, finalSuallar);
  } catch {
    return finalSuallar;
  }
}
