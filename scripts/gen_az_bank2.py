# -*- coding: utf-8 -*-
import json

data = []

def add(sual, secimler, duzgun, movzu, sinif="8"):
    data.append({"sual": sual, "secimler": secimler, "duzgun": duzgun, "movzu": movzu, "sinif": sinif, "fenn": "Azərbaycan dili"})

# ---- Nitq hissələri: kontekstual, çoxaddımlı ----
add(
    "\"Aç qapını!\" və \"Onun aç gözləri hər şeyi görürdü\" cümlələrində \"aç\" sözünün nitq hissəsi necə fərqlənir?",
    ["Hər iki cümlədə fel", "Birincidə fel (əmr forması), ikincidə sifət", "Hər iki cümlədə sifət", "Birincidə isim, ikincidə zərf"],
    1, "Nitq hissələri"
)
add(
    "\"Yaxşı oxu\" və \"O, yaxşı adamdır\" cümlələrində \"yaxşı\" sözünün nitq hissəsi hər iki cümlədə eynidirmi?",
    ["Bəli, hər ikisində zərfdir", "Xeyr — birincidə zərf, ikincidə sifətdir", "Xeyr — birincidə sifət, ikincidə zərfdir", "Bəli, hər ikisində sifətdir"],
    1, "Nitq hissələri"
)
add(
    "\"Bu il qış sərt keçdi\" cümləsində \"bu\" sözü hansı nitq hissəsidir və funksiyası nədir?",
    ["Əvəzlikdir, \"il\" sözünü əvəz edir", "İşarə əvəzliyidir, \"il\" sözünü təyin edir", "Sifətdir, müstəqil işlənir", "Zərfdir, feli təyin edir"],
    1, "Nitq hissələri"
)
add(
    "\"Beş nəfər gəldi\" və \"Beşinci sırada oturdu\" cümlələrində \"beş\" sözlərinin say növü necə fərqlənir?",
    ["Hər ikisi miqdar sayıdır", "Birincisi miqdar sayı, ikincisi sıra sayıdır", "Birincisi sıra sayı, ikincisi miqdar sayıdır", "Hər ikisi sıra sayıdır"],
    1, "Nitq hissələri"
)
add(
    "\"O, işi tez bitirdi, çünki bacarıqlı idi\" cümləsində \"çünki\" sözünün rolu nədir?",
    ["Qoşmadır, əvvəlki sözə aid olur", "Bağlayıcıdır, səbəb budaq cümləsini əsas cümləyə bağlayır", "Ədatdır, mənanı gücləndirir", "Nidadır, emosiya bildirir"],
    1, "Nitq hissələri"
)

# ---- Söz quruluşu (kombinasiya) ----
add(
    "\"Müəllim dəmiryolu ilə şəhərə getdi\" cümləsində hansı sözlərin quruluşu düzgün göstərilib?",
    ["müəllim — mürəkkəb, dəmiryolu — düzəltmə", "müəllim — düzəltmə (şəkilçili), dəmiryolu — mürəkkəb", "hər ikisi sadə söz", "hər ikisi mürəkkəb söz"],
    1, "Söz quruluşu"
)
add(
    "\"Yazıçının kitabxanası zəngin idi\" cümləsində \"yazıçı\" və \"kitabxana\" sözlərinin quruluşu haqqında hansı fikir doğrudur?",
    ["Hər ikisi sadə sözdür", "\"Yazıçı\" düzəltmədir (yaz+ıçı), \"kitabxana\" isə ərəb mənşəli mürəkkəb sözdür", "Hər ikisi mürəkkəb sözdür", "\"Yazıçı\" mürəkkəbdir, \"kitabxana\" sadədir"],
    1, "Söz quruluşu"
)
add(
    "Aşağıdakı sözlərdən hansı cüt söz nümunəsidir və niyə?",
    ["\"gözəllik\" — şəkilçi ilə düzəlib", "\"əl-ayaq\" — iki müstəqil sözün təkrarsız birləşməsi ilə yeni məna yaranıb", "\"dəmiryol\" — iki kök birləşərək tək məna bildirir", "\"başçı\" — kökə şəkilçi artırılıb"],
    1, "Söz quruluşu"
)

# ---- Cümlə üzvləri (mürəkkəb) ----
add(
    "\"Kənddə yaşayan qoca çoban hər səhər sürünü otarmağa aparırdı\" cümləsində \"kənddə yaşayan\" söz birləşməsi hansı cümlə üzvünə aiddir?",
    ["Mübtədaya aid təyin", "Xəbərə aid zərflik", "Tamamlığa aid təyin", "Müstəqil cümlə üzvü"],
    0, "Cümlə üzvləri"
)
add(
    "\"Müəllim şagirdlərə kitabı diqqətlə oxumağı tapşırdı\" cümləsində \"diqqətlə\" sözü hansı üzvə aiddir və nəyi bildirir?",
    ["Mübtədaya aiddir, subyekti bildirir", "\"oxumağı\" sözünə aid zərflikdir, hərəkət tərzini bildirir", "Tamamlıqdır, obyekti bildirir", "Təyindir, əşyanın əlamətini bildirir"],
    1, "Cümlə üzvləri"
)
add(
    "\"O, yorğun olsa da, işini vaxtında bitirdi\" mürəkkəb cümləsində budaq cümlə əsas cümləyə hansı məna əlaqəsi ilə bağlanıb?",
    ["Səbəb əlaqəsi", "Zaman əlaqəsi", "Güzəşt (ziddiyyət) əlaqəsi", "Şərt əlaqəsi"],
    2, "Cümlə üzvləri"
)
add(
    "\"Kitabı oxuyan şagird sualları asanlıqla cavablandırdı\" cümləsində \"kitabı oxuyan\" tərkibi ilə \"şagird\" sözü arasındakı əlaqə necə adlanır?",
    ["Tabesizlik əlaqəsi", "Təyini söz birləşməsi (təyin — təyin olunan)", "Xəbərlik əlaqəsi", "Bağlayıcı əlaqəsi"],
    1, "Cümlə üzvləri"
)

# ---- Punktuasiya (mürəkkəb tətbiq) ----
add(
    "\"Bazardan alma, armud, üzüm və nar aldıq\" cümləsində vergüllərin sayı düzgün qoyulubmu?",
    ["Bəli, sadalanan hər üzv arasında vergül olmalıdır, sonuncudan əvvəl \"və\"dən qabaq lazım deyil — düzgündür", "Xeyr, \"və\"dən əvvəl də vergül olmalı idi", "Xeyr, heç bir vergül lazım deyildi", "Xeyr, yalnız bir vergül kifayət edərdi"],
    0, "Punktuasiya"
)
add(
    "\"Yağış yağırdı, lakin uşaqlar bayırda oynayırdı\" cümləsində vergülün funksiyası nədir?",
    ["Sadalama əlaqəsini göstərir", "Tabesiz mürəkkəb cümlədə ziddiyyət bildirən \"lakin\" bağlayıcısından əvvəl qoyulub", "Müraciəti ayırır", "Aralıq söz ayırır"],
    1, "Punktuasiya"
)
add(
    "\"Direktor dedi ki sabah toplantı olacaq\" cümləsində punktuasiya baxımından hansı düzəliş lazımdır?",
    ["Heç bir düzəliş lazım deyil", "\"ki\"dən əvvəl vergül qoyulmalıdır (izafi budaq cümlə)", "Cümlənin sonuna nida işarəsi qoyulmalıdır", "\"dedi\"dən sonra iki nöqtə qoyulmalıdır"],
    1, "Punktuasiya"
)
add(
    "\"Salam dostum necəsən\" cümləsi düzgün punktuasiya ilə necə yazılmalıdır?",
    ["\"Salam, dostum, necəsən?\" — müraciət vergüllə ayrılır, sual əlaməti qoyulur", "\"Salam. Dostum. Necəsən.\"", "\"Salam dostum, necəsən!\"", "Heç bir işarə lazım deyil"],
    0, "Punktuasiya"
)

# ---- Orfoqrafiya (tətbiqi) ----
add(
    "\"Hər gün məktəbəgetmə vaxtım səhər saat 8-dir\" cümləsində orfoqrafik səhv hansıdır?",
    ["\"məktəbəgetmə\" ayrı yazılmalıdır: \"məktəbə getmə\"", "\"hər gün\" birləşdirilməlidir", "\"saat\" böyük hərflə yazılmalıdır", "Heç bir səhv yoxdur"],
    0, "Orfoqrafiya"
)
add(
    "\"Bu kitab mənimki, o isə sənin ki dir\" cümləsində orfoqrafik səhv hansıdır?",
    ["\"mənimki\" ayrı yazılmalıdır", "\"sənin ki dir\" bitişik yazılmalıdır: \"səninkidir\"", "\"kitab\" böyük hərflə başlamalıdır", "Heç bir səhv yoxdur"],
    1, "Orfoqrafiya"
)
add(
    "\"Azərbaycan Respublikasının paytaxtı Bakı şəhəridir\" cümləsində böyük hərflə yazılış qaydasına əsasən hansı sözlər doğru yazılıb?",
    ["Yalnız \"Azərbaycan\"", "\"Azərbaycan Respublikası\" və \"Bakı\" — xüsusi adlar olduğu üçün", "Heç biri böyük hərflə yazılmamalı idi", "Yalnız \"Respublikasının\""],
    1, "Orfoqrafiya"
)

with open("/home/claude/repetitor/src/data/azDiliBank.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Total:", len(data))
