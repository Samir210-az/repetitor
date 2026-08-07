import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, GraduationCap, Plus, Phone, Eye, MapPin, Monitor } from "lucide-react";
import { db, ref, onValue, set } from "../lib/firebase.js";

const ADMIN_PIN = "AN2026EA";
const DAY = 24 * 60 * 60 * 1000;

export default function SuperAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tenants, setTenants] = useState({});
  const [dbError, setDbError] = useState("");
  const [visits, setVisits] = useState({});
  const [tab, setTab] = useState("repetitorlar");

  useEffect(() => {
    if (!authed) return;
    const r2 = ref(db, "repetitor/analytics");
    const unsub2 = onValue(r2, (snap) => setVisits(snap.val() || {}));
    return () => unsub2();
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    const r = ref(db, "repetitor/tenants");
    const unsub = onValue(
      r,
      (snap) => {
        setDbError("");
        setTenants(snap.val() || {});
      },
      (err) => setDbError(err.message || String(err))
    );
    return () => unsub();
  }, [authed]);

  function handlePin(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthed(true);
      setError("");
    } else {
      setError("PIN yanlışdır.");
    }
  }

  const [writeError, setWriteError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [doneId, setDoneId] = useState(null);

  async function extend(tenantId, currentAccessUntil, days) {
    const key = `${tenantId}-${days}`;
    setBusyId(key);
    setWriteError("");
    try {
      const base = currentAccessUntil && currentAccessUntil > Date.now() ? currentAccessUntil : Date.now();
      await set(ref(db, `repetitor/tenants/${tenantId}/profil/access_until`), base + days * DAY);
      const plan = days >= 365 ? "illik" : days >= 28 ? "aylıq" : "sınaq";
      await set(ref(db, `repetitor/tenants/${tenantId}/profil/plan`), plan);
      setDoneId(key);
      setTimeout(() => setDoneId((cur) => (cur === key ? null : cur)), 1500);
    } catch (err) {
      setWriteError(err.message || String(err));
    } finally {
      setBusyId(null);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center container-px py-16">
        <motion.form
          onSubmit={handlePin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5">
            <Lock className="text-gold" size={20} />
          </div>
          <h1 className="font-display text-xl font-semibold text-white mb-1">Ustad Panel</h1>
          <p className="text-white/40 text-sm mb-6">Yalnız SECURITY GROUP admin girişi</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-gold/60 mb-3"
          />
          {error && <p className="text-coral text-sm mb-3">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center !py-3">Daxil ol</button>
        </motion.form>
      </div>
    );
  }

  const list = Object.entries(tenants).sort((a, b) => (b[1].profil?.yaradilib || 0) - (a[1].profil?.yaradilib || 0));

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink text-white">
        <div className="container-px max-w-7xl mx-auto flex items-center gap-2 py-5 font-display text-lg font-semibold">
          <span className="w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center text-ink">
            <GraduationCap size={16} />
          </span>
          Repetitor — Ustad Panel
          <span className="text-white/40 font-body text-sm font-normal ml-2">{list.length} repetitor</span>
        </div>
      </header>

      <main className="container-px max-w-7xl mx-auto py-10">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("repetitorlar")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === "repetitorlar" ? "bg-gold text-ink" : "bg-white/5 text-slateink/60 border border-black/10"
            }`}
          >
            Repetitorlar
          </button>
          <button
            onClick={() => setTab("ziyaretciler")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              tab === "ziyaretciler" ? "bg-gold text-ink" : "bg-white/5 text-slateink/60 border border-black/10"
            }`}
          >
            <Eye size={14} /> Ziyarətçilər
          </button>
        </div>

        {dbError && (
          <div className="card-dark border-coral/30 p-5 mb-6">
            <p className="text-coral text-sm font-semibold mb-1">Firebase icazə xətası</p>
            <p className="text-white/50 text-xs font-mono break-all">{dbError}</p>
            <p className="text-white/40 text-xs mt-2">
              Firebase Console → Realtime Database → Rules bölməsində "tenants" səviyyəsinə
              <code className="text-gold"> .read: true </code> əlavə et.
            </p>
          </div>
        )}
        {writeError && (
          <div className="card-dark border-coral/30 p-5 mb-6">
            <p className="text-coral text-sm font-semibold mb-1">Uzatma alınmadı</p>
            <p className="text-white/50 text-xs font-mono break-all">{writeError}</p>
          </div>
        )}

        {tab === "repetitorlar" && (
          list.length === 0 ? (
            <div className="card-dark p-12 text-center">
              <p className="text-white/35 text-sm">Hələ qeydiyyatdan keçən repetitor yoxdur.</p>
            </div>
          ) : (
            <div className="card-dark divide-y divide-white/10">
              {list.map(([id, t]) => {
                const p = t.profil || {};
                const until = p.access_until;
                const daysLeft = until ? Math.ceil((until - Date.now()) / DAY) : null;
                const expired = until && Date.now() > until;
                return (
                  <div key={id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{p.ad || id}</p>
                      <p className="text-xs text-white/45 flex items-center gap-1.5 mt-0.5">
                        <Phone size={11} /> {p.telefon || "—"} · {p.fenn || "—"}
                      </p>
                      <p className={`text-xs mt-1 font-mono ${expired ? "text-coral" : "text-emerald"}`}>
                        {until
                          ? expired
                            ? `Bitib (${Math.abs(daysLeft)} gün əvvəl)`
                            : `${daysLeft} gün qalıb`
                          : "Müddət təyin olunmayıb"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => extend(id, until, 7)}
                        disabled={busyId === `${id}-7`}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 disabled:opacity-40 ${
                          doneId === `${id}-7` ? "bg-emerald/15 border-emerald/40 text-emerald" : "bg-white/5 border-white/10 text-white/70 active:border-gold/50 active:text-gold"
                        }`}
                      >
                        <Plus size={12} /> {busyId === `${id}-7` ? "..." : doneId === `${id}-7` ? "✓ Oldu" : "7 gün"}
                      </button>
                      <button
                        onClick={() => extend(id, until, 30)}
                        disabled={busyId === `${id}-30`}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 disabled:opacity-40 ${
                          doneId === `${id}-30` ? "bg-emerald/15 border-emerald/40 text-emerald" : "bg-white/5 border-white/10 text-white/70 active:border-gold/50 active:text-gold"
                        }`}
                      >
                        <Plus size={12} /> {busyId === `${id}-30` ? "..." : doneId === `${id}-30` ? "✓ Oldu" : "1 ay"}
                      </button>
                      <button
                        onClick={() => extend(id, until, 365)}
                        disabled={busyId === `${id}-365`}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 disabled:opacity-40 ${
                          doneId === `${id}-365` ? "bg-emerald/15 border-emerald/40 text-emerald" : "bg-gold/10 border-gold/30 text-gold hover:bg-gold/20"
                        }`}
                      >
                        <Plus size={12} /> {busyId === `${id}-365` ? "..." : doneId === `${id}-365` ? "✓ Oldu" : "1 il"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === "ziyaretciler" && <VisitorsList visits={visits} />}
      </main>
    </div>
  );
}

function VisitorsList({ visits }) {
  const list = Object.entries(visits).sort((a, b) => (b[1].tarix || 0) - (a[1].tarix || 0));

  if (list.length === 0) {
    return (
      <div className="card-dark p-12 text-center">
        <p className="text-white/35 text-sm">Hələ ziyarətçi qeydə alınmayıb.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-slateink/50 text-sm mb-4">Cəmi: {list.length} ziyarət</p>
      <div className="card-dark divide-y divide-white/10">
        {list.map(([id, v]) => (
          <div key={id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="text-white font-medium text-sm font-mono">{v.ip || "naməlum IP"}</p>
              <p className="text-white/45 text-xs flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} /> {[v.sehir, v.olke].filter(Boolean).join(", ") || "Naməlum yer"}
                {v.isp && ` · ${v.isp}`}
              </p>
              <p className="text-white/35 text-xs flex items-center gap-1.5 mt-0.5">
                <Monitor size={11} /> {v.cihaz} · {v.brauzer} · {v.sehife}
              </p>
            </div>
            <span className="text-white/40 text-xs font-mono shrink-0">
              {new Date(v.tarix).toLocaleString("az-AZ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
