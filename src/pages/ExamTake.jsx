import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Clock, CheckCircle2, XCircle, Loader2, Lock } from "lucide-react";
import { db, ref, get, set, tenantPath } from "../lib/firebase.js";

const DURATION_SEC = 60 * 60; // 60 dəqiqə

// Firebase massivi bəzən obyekt kimi qaytarır (bax: Dashboard.jsx-dəki eyni funksiya) —
// bu, .map() çağırışını çökdürməsin deyə hər iki halı təhlükəsiz massivə çevirir.
function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") return Object.values(v);
  return [];
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ExamTake() {
  const { tenantId, testId } = useParams();

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [test, setTest] = useState(null);
  const [students, setStudents] = useState({});
  const [profil, setProfil] = useState(null);
  const [openedAt] = useState(Date.now());

  const [sagirdId, setSagirdId] = useState("");
  const [formError, setFormError] = useState("");
  const [checking, setChecking] = useState(false);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SEC);

  useEffect(() => {
    async function load() {
      try {
        const testSnap = await get(ref(db, tenantPath(tenantId, "testler", testId)));
        if (!testSnap.exists()) {
          setLoadError("Test tapılmadı. Link səhv ola bilər.");
          setLoadingInit(false);
          return;
        }
        setTest(testSnap.val());
        const studSnap = await get(ref(db, tenantPath(tenantId, "sagirdler")));
        setStudents(studSnap.val() || {});
        const profSnap = await get(ref(db, tenantPath(tenantId, "profil")));
        setProfil(profSnap.val() || null);
      } catch (e) {
        setLoadError("Yüklənmə xətası: " + e.message);
      } finally {
        setLoadingInit(false);
      }
    }
    load();
  }, [tenantId, testId]);

  useEffect(() => {
    if (!started || result) return;
    if (secondsLeft <= 0) {
      submitExam();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, secondsLeft, result]);

  const suallar = useMemo(() => toArray(test?.suallar), [test]);

  async function checkAttemptAndStart() {
    if (!sagirdId) {
      setFormError("Zəhmət olmasa adını seç.");
      return;
    }
    setFormError("");
    setChecking(true);
    try {
      const existing = await get(ref(db, tenantPath(tenantId, "testler", testId, "neticeler", sagirdId)));
      if (existing.exists()) {
        setResult(existing.val());
      } else {
        setStarted(true);
      }
    } catch (e) {
      setFormError("Xəta: " + e.message);
    } finally {
      setChecking(false);
    }
  }

  function pick(qIndex, optIndex) {
    setAnswers((a) => ({ ...a, [qIndex]: optIndex }));
  }

  async function submitExam() {
    if (submitting || result) return;
    setSubmitting(true);
    let correctCount = 0;
    const cavablar = suallar.map((q, i) => {
      const secilen = answers[i];
      const opts = Array.isArray(q.secimler) ? q.secimler : [];
      const isCorrect = secilen === q.duzgun;
      if (isCorrect) correctCount += 1;
      return { sual: q.sual, secimler: opts, duzgun: q.duzgun, secilen: secilen ?? null, isCorrect };
    });
    const cemi = suallar.length;
    const faiz = cemi > 0 ? Math.round((correctCount / cemi) * 100) : 0;
    const payload = {
      ad: students[sagirdId]?.ad || "Naməlum",
      bal: correctCount,
      cemi,
      faiz,
      tarix: Date.now(),
      baslik: test?.baslik || "",
      testId,
      cavablar,
    };
    try {
      await set(ref(db, tenantPath(tenantId, "testler", testId, "neticeler", sagirdId)), payload);
      await set(ref(db, tenantPath(tenantId, "sagirdler", sagirdId, "neticeler", testId)), payload);
      setResult(payload);
    } catch (e) {
      setFormError("Nəticə yadda saxlanmadı: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingInit) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={28} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center container-px text-center">
        <p className="text-coral">{loadError}</p>
      </div>
    );
  }

  const studentList = Object.entries(students);

  // ---- Nəticə ekranı (təzə göndərildi və ya artıq göndərilmişdi) ----
  if (result) {
    return (
      <div className="min-h-screen bg-paper py-10 container-px">
        <div className="max-w-2xl mx-auto">
          <div className="card-dark p-8 text-center mb-6">
            <p className="text-white/50 text-sm font-mono uppercase tracking-wide mb-2">{result.baslik}</p>
            <p className="font-display text-5xl font-bold text-gold mb-1">{result.bal}/{result.cemi}</p>
            <p className="text-white/60 mb-3">{result.faiz}% doğru cavab</p>
            <p className="text-white/30 text-xs font-mono">
              Repetitor: {profil?.ad || "—"} · {new Date(result.tarix).toLocaleDateString("az-AZ")} {new Date(result.tarix).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <p className="text-slateink/50 text-sm mb-4">Cavab açarı:</p>
          <div className="space-y-3">
            {toArray(result.cavablar).map((c, i) => (
              <div key={i} className="card p-4">
                <p className="font-medium text-slateink mb-2">{i + 1}. {c.sual}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {(Array.isArray(c.secimler) ? c.secimler : []).map((opt, oi) => {
                    const isPicked = oi === c.secilen;
                    const isRight = oi === c.duzgun;
                    const wrongPick = isPicked && !isRight;
                    return (
                      <div
                        key={oi}
                        className={`text-sm rounded-lg px-3 py-2.5 border-2 flex items-center justify-between gap-2 ${
                          isRight ? "border-emerald bg-emerald/10" : wrongPick ? "border-coral bg-coral/10" : "border-black/10"
                        }`}
                      >
                        <span className={`${isRight || wrongPick ? "font-medium" : ""} text-slateink/80`}>
                          {String.fromCharCode(65 + oi)}) {opt}
                        </span>
                        {isRight && (
                          <span className="flex items-center gap-1 text-emerald text-xs font-semibold shrink-0">
                            <CheckCircle2 size={14} /> Düzgün
                          </span>
                        )}
                        {wrongPick && (
                          <span className="flex items-center gap-1 text-coral text-xs font-semibold shrink-0">
                            <XCircle size={14} /> Sənin cavabın
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {c.secilen === null && <p className="text-xs text-coral/70 mt-2">Bu suala cavab vermədin.</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- İmtahan (başlayıb) ----
  if (started) {
    return (
      <div className="min-h-screen bg-paper py-6 container-px">
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur py-3 mb-6 flex items-center justify-between border-b border-black/5">
            <p className="font-display text-lg font-semibold text-slateink truncate pr-3">{test.baslik}</p>
            <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold px-3 py-1.5 rounded-full shrink-0 ${
              secondsLeft < 300 ? "bg-coral/10 text-coral" : "bg-gold/10 text-[#B8862F]"
            }`}>
              <Clock size={14} /> {fmt(secondsLeft)}
            </div>
          </div>

          <div className="space-y-5 mb-8">
            {suallar.map((q, i) => {
              const opts = Array.isArray(q.secimler) ? q.secimler : [];
              return (
                <div key={i} className="card p-4">
                  <p className="font-medium text-slateink mb-3">{i + 1}. {q.sual}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {opts.map((opt, oi) => (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => pick(i, oi)}
                        className={`text-left text-sm rounded-lg px-3 py-2 border transition-colors ${
                          answers[i] === oi ? "border-gold bg-gold/10 text-slateink" : "border-black/10 text-slateink/70 hover:border-gold/40"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}) {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={submitExam}
            disabled={submitting}
            className="btn-primary w-full justify-center !py-3.5 mb-10"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : `Göndər (${Object.keys(answers).length}/${suallar.length} cavablanıb)`}
          </button>
        </div>
      </div>
    );
  }

  // ---- Ad seçimi (başlamazdan əvvəl) ----
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center container-px py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8"
      >
        <div className="flex items-center gap-2 justify-center mb-6 text-white font-display text-xl font-semibold">
          <span className="w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center text-ink">
            <GraduationCap size={18} />
          </span>
          Repetitor İmtahan
        </div>
        <p className="text-white/50 text-sm text-center mb-1">{test?.baslik}</p>
        <p className="text-white/30 text-xs text-center mb-1 font-mono">
          Repetitor: {profil?.ad || "—"} · {new Date(openedAt).toLocaleDateString("az-AZ")} {new Date(openedAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-white/30 text-xs text-center mb-6 flex items-center justify-center gap-1.5">
          <Clock size={12} /> 60 dəqiqə vaxtın var, 1 cəhd haqqın var
        </p>

        <label className="block mb-4">
          <span className="text-xs font-medium text-white/50 mb-1.5 block">Adını seç</span>
          <select
            value={sagirdId}
            onChange={(e) => setSagirdId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/60"
          >
            <option value="">— Seç —</option>
            {studentList.map(([id, s]) => (
              <option key={id} value={id}>{s.ad}</option>
            ))}
          </select>
        </label>

        {formError && <p className="text-coral text-sm mb-4 bg-coral/10 rounded-lg px-3 py-2 flex items-center gap-1.5"><Lock size={13} /> {formError}</p>}

        <button onClick={checkAttemptAndStart} disabled={checking} className="btn-primary w-full justify-center !py-3">
          {checking ? <Loader2 className="animate-spin" size={18} /> : "İmtahana başla"}
        </button>
      </motion.div>
    </div>
  );
}
