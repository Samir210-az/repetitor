import json

data = []

def add(sual, secimler, duzgun, movzu, sinif="8"):
    data.append({"sual": sual, "secimler": secimler, "duzgun": duzgun, "movzu": movzu, "sinif": sinif, "fenn": "Azərbaycan dili"})

# ---- NİTQ HİSSƏLƏRİ (sözün nitq hissəsini tapmaq) ----
nitq_ornekleri = [
    ("Dağların zirvəsi qarla örtülmüşdü.", "zirvəsi", ["isim", "sifət", "əvəzlik", "say"], 0),
    ("O, çox ağıllı bir tələbədir.", "ağıllı", ["isim", "sifət", "zərf", "fel"], 1),
    ("Uşaqlar bağçada sürətlə qaçırdılar.", "sürətlə", ["sifət", "isim", "zərf", "say"], 2),
    ("Beş kitab masanın üstündədir.", "Beş", ["isim", "say", "əvəzlik", "sifət"], 1),
    ("Mən sabah İstanbula gedəcəyəm.", "Mən", ["isim", "əvəzlik", "sifət", "say"], 1),
    ("Külək şiddətlə əsirdi.", "əsirdi", ["isim", "sifət", "fel", "zərf"], 2),
    ("Kitabxanada və muzeydə eyni sərgi var.", "və", ["qoşma", "bağlayıcı", "ədat", "nida"], 1),
    ("Bu barədə heç nə demədi.", "heç", ["say", "ədat", "əvəzlik", "zərf"], 1),
    ("Bax, göydə uçan quşlar!", "Bax", ["fel", "nida", "isim", "zərf"], 1),
    ("Dostum kimi sən də gec gəldin.", "kimi", ["bağlayıcı", "qoşma", "ədat", "əvəzlik"], 1),
    ("Yağış yağdıqca hava sərinləşirdi.", "yağdıqca", ["isim", "fel", "zərf", "sifət"], 1),
    ("Onun üç qardaşı var.", "üç", ["isim", "sifət", "say", "əvəzlik"], 2),
    ("Şəhərin ən gözəl parkı budur.", "ən", ["ədat", "zərf", "bağlayıcı", "sifət"], 0),
    ("Biz sabahkı görüşdə iştirak edəcəyik.", "sabahkı", ["zərf", "sifət", "isim", "say"], 1),
    ("Kitabı diqqətlə oxudu.", "diqqətlə", ["sifət", "zərf", "isim", "fel"], 1),
]
for cumle, soz, sec, d in nitq_ornekleri:
    add(f"Aşağıdakı cümlədə \"{soz}\" sözü hansı nitq hissəsindəndir? — \"{cumle}\"", sec, d, "Nitq hissələri")

# ---- SÖZ QURULUŞU (sadə/düzəltmə/mürəkkəb) ----
soz_ornekleri = [
    ("kitabxana", ["Sadə söz", "Düzəltmə söz", "Mürəkkəb söz", "Cüt söz"], 2),
    ("müəllim", ["Sadə söz", "Düzəltmə söz (şəkilçi ilə)", "Mürəkkəb söz", "Cüt söz"], 1),
    ("ev", ["Sadə söz", "Düzəltmə söz", "Mürəkkəb söz", "Cüt söz"], 0),
    ("əl-ayaq", ["Sadə söz", "Düzəltmə söz", "Mürəkkəb söz", "Cüt söz"], 3),
    ("başçı", ["Sadə söz", "Düzəltmə söz (şəkilçi ilə)", "Mürəkkəb söz", "Cüt söz"], 1),
    ("dəmiryol", ["Sadə söz", "Düzəltmə söz", "Mürəkkəb söz", "Cüt söz"], 2),
    ("gözəllik", ["Sadə söz", "Düzəltmə söz (şəkilçi ilə)", "Mürəkkəb söz", "Cüt söz"], 1),
    ("ana-bala", ["Sadə söz", "Düzəltmə söz", "Mürəkkəb söz", "Cüt söz"], 3),
    ("yazıçı", ["Sadə söz", "Düzəltmə söz (şəkilçi ilə)", "Mürəkkəb söz", "Cüt söz"], 1),
    ("suvat" if False else "gülab" , ["Sadə söz", "Düzəltmə söz", "Mürəkkəb söz (gül+ab)", "Cüt söz"], 2),
]
for soz, sec, d in soz_ornekleri:
    add(f"\"{soz}\" sözü quruluşuna görə hansı növ sözdür?", sec, d, "Söz quruluşu")

# ---- CÜMLƏ ÜZVLƏRİ ----
cumle_uzvleri = [
    ("Balaca qız bağda gül dərdi.", "qız", ["Xəbər", "Mübtəda", "Tamamlıq", "Təyin"], 1),
    ("Balaca qız bağda gül dərdi.", "Balaca", ["Mübtəda", "Xəbər", "Təyin", "Zərflik"], 2),
    ("Balaca qız bağda gül dərdi.", "gül", ["Mübtəda", "Xəbər", "Tamamlıq", "Zərflik"], 2),
    ("Balaca qız bağda gül dərdi.", "bağda", ["Mübtəda", "Tamamlıq", "Zərflik", "Təyin"], 2),
    ("Nihad dərsini diqqətlə hazırladı.", "hazırladı", ["Mübtəda", "Xəbər", "Tamamlıq", "Zərflik"], 1),
    ("Müəllim şagirdlərə maraqlı sual verdi.", "şagirdlərə", ["Mübtəda", "Xəbər", "Tamamlıq", "Təyin"], 2),
    ("Kənddə qoca bir çinar bitirdi.", "qoca", ["Mübtəda", "Xəbər", "Təyin", "Tamamlıq"], 2),
    ("O, sürətlə evə tərəf qaçdı.", "sürətlə", ["Mübtəda", "Xəbər", "Zərflik", "Tamamlıq"], 2),
]
for cumle, soz, sec, d in cumle_uzvleri:
    add(f"\"{cumle}\" cümləsində \"{soz}\" sözü cümlənin hansı üzvüdür?", sec, d, "Cümlə üzvləri")

# ---- PUNKTUASİYA ----
punkt = [
    ("Kitabı, dəftəri və qələmi çantaya qoydu.", ["Sadalama zamanı vergül işlənməsi", "Sual əlaməti", "Nöqtəli vergül", "İki nöqtə"], 0),
    ("O dedi: \"Sabah gələcəyəm.\"", ["Vergül", "İki nöqtə və dırnaq işarəsi (birbaşa nitq)", "Tire", "Nöqtəli vergül"], 1),
    ("Hava soyuq idi; küçələr isə boş.", ["Vergül", "İki nöqtə", "Nöqtəli vergül (əlaqəli, lakin ayrı fikirlər)", "Tire"], 2),
    ("Kim gəldi? — deyə soruşdu.", ["Sual əlaməti və tire", "Nöqtə", "Vergül", "İki nöqtə"], 0),
    ("Ey dostlar, bu gün bayramdır!", ["Nida işarəsi (müraciət və emosiya)", "Sual əlaməti", "Nöqtəli vergül", "Tire"], 0),
]
for cumle, sec, d in punkt:
    add(f"\"{cumle}\" cümləsində hansı durğu işarəsi(ləri) düzgün istifadə olunub və nə üçün?", sec, d, "Punktuasiya")

with open("/home/claude/repetitor/src/data/azDiliBank.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Total:", len(data))
