import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { db, ref, set, get, tenantPath } from "../lib/firebase.js";
import { saveSession, slugify } from "../lib/session.js";
import { trackVisit } from "../lib/analytics.js";

const cleanPhone = (p) => p.replace(/[^\d]/g, "");

export default function Auth() {
  const location = useLocation();
  const isRegister = location.pathname.includes("qeydiyyat");
  const navigate = useNavigate();

  useEffect(() => {
    trackVisit(isRegister ? "Qeydiyyat" : "Giriş");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [ad, setAd] = useState("");
  const [fenn, setFenn] = useState("");
  const [telefon, setTelefon] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (!ad || !fenn || !telefon || pin.length < 4) {
      setError("Zəhmət olmasa bütün xanaları doldur (PIN minimum 4 rəqəm olsun).");
      return;
    }
    setLoading(true);
    try {
      const phoneKey = cleanPhone(telefon);
      const indexRef = ref(db, `repetitor/phone_index/${phoneKey}`);
      const existing = await get(indexRef);
      if (existing.exists()) {
        setError("Bu nömrə ilə artıq qeydiyyat var. Daxil ol səhifəsindən gir.");
        setLoading(false);
        return;
      }
      const tenantId = `${slugify(ad)}-${phoneKey.slice(-4)}`;
      const trialDays = 7;
      await set(ref(db, tenantPath(tenantId, "profil")), {
        ad,
        fenn,
        telefon,
        pin,
        yaradilib: Date.now(),
        access_until: Date.now() + trialDays * 24 * 60 * 60 * 1000,
        plan: "sınaq",
      });
      await set(indexRef, tenantId);
      saveSession(tenantId, { ad, fenn });
      navigate("/panel");
    } catch (err) {
      setError("Xəta baş verdi: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!telefon || !pin) {
      setError("Telefon nömrəsi və PIN daxil et.");
      return;
    }
    setLoading(true);
    try {
      const phoneKey = cleanPhone(telefon);
      const indexSnap = await get(ref(db, `repetitor/phone_index/${phoneKey}`));
      if (!indexSnap.exists()) {
        setError("Bu nömrə ilə qeydiyyat tapılmadı.");
        setLoading(false);
        return;
      }
      const tenantId = indexSnap.val();
      const profilSnap = await get(ref(db, tenantPath(tenantId, "profil")));
      const profil = profilSnap.val();
      if (!profil || String(profil.pin) !== String(pin)) {
        setError("PIN yanlışdır.");
        setLoading(false);
        return;
      }
      saveSession(tenantId, { ad: profil.ad, fenn: profil.fenn });
      navigate("/panel");
    } catch (err) {
      setError("Xəta baş verdi: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center container-px py-16 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl animate-floaty" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-emerald/10 blur-3xl animate-floaty2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 text-white font-display text-xl font-semibold">
          <span className="w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center text-ink">
            <GraduationCap size={18} />
          </span>
          Repetitor
        </Link>

        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex gap-2 mb-7 bg-white/5 rounded-full p-1">
            <Link
              to="/qeydiyyat"
              className={`flex-1 text-center text-sm font-medium py-2.5 rounded-full transition-all ${
                isRegister ? "bg-gold text-ink" : "text-white/60 hover:text-white"
              }`}
            >
              Qeydiyyat
            </Link>
            <Link
              to="/giris"
              className={`flex-1 text-center text-sm font-medium py-2.5 rounded-full transition-all ${
                !isRegister ? "bg-gold text-ink" : "text-white/60 hover:text-white"
              }`}
            >
              Daxil ol
            </Link>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <Field label="Adın Soyadın" value={ad} onChange={setAd} placeholder="Elçin Əsədli" />
                <Field label="Fənn / İxtisas" value={fenn} onChange={setFenn} placeholder="Riyaziyyat, Kodlaşdırma..." />
              </>
            )}
            <Field label="Telefon nömrəsi" value={telefon} onChange={setTelefon} placeholder="051 457 25 38" type="tel" />
            <Field
              label={isRegister ? "PIN təyin et (min. 4 rəqəm)" : "PIN"}
              value={pin}
              onChange={setPin}
              placeholder="••••"
              type="password"
              maxLength={8}
            />

            {error && <p className="text-coral text-sm bg-coral/10 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3 mt-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>{isRegister ? "Hesab yarat" : "Daxil ol"} <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-white/30 text-xs mt-6 font-mono">
          Məlumatların tam ayrı və qorunur — heç kim başqasının panelini görə bilməz.
        </p>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", maxLength }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-white/50 mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25
        focus:outline-none focus:border-gold/60 focus:bg-white/[0.08] transition-all"
      />
    </label>
  );
}
