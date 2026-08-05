# Repetitor CRM

Repetitorlar üçün multi-tenant idarəetmə sistemi — şagird, qrup, ödəniş və davamiyyət izləmə.

## Stack
- React + Vite + Tailwind CSS
- Framer Motion (animasiyalar, parallax)
- Firebase Realtime Database (multi-tenant, hər repetitor üçün tam ayrı data)
- React Router

## Quraşdırma

```bash
npm install
npm run dev
```

## Firebase qurulması

`src/lib/firebase.js` faylında `TODO` qeydinə bax — Firebase Console-da `repetitor` adlı yeni layihə yarat, Realtime Database əlavə et və konfiqurasiya məlumatlarını əvəz et.

## Data strukturu

```
repetitor/
  phone_index/{telefon} -> tenantId
  tenants/{tenantId}/
    profil/        (ad, fənn, telefon, PIN)
    qruplar/
    sagirdler/
    odenishler/
    davamiyyet/
```

---
By securtiy_group — [instagram.com/securtiy_group](https://instagram.com/securtiy_group)
