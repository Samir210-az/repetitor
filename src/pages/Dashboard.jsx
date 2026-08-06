import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, CalendarClock, Wallet, ClipboardCheck,
  LogOut, Plus, Trash2, Check, X, Lock, FileQuestion, Sparkles,
  Printer, ChevronLeft, Loader2, Share2, TrendingUp,
} from "lucide-react";
import { db, ref, onValue, push, set, remove, tenantPath } from "../lib/firebase.js";
import { getSession, clearSession } from "../lib/session.js";
import { generateTest } from "../lib/ai.js";
import StatusBoard from "../components/StatusBoard.jsx";

const TABS = [
  { id: "qruplar", label: "Qruplar", icon: CalendarClock },
  { id: "sagirdler", label: "Şagirdlər", icon: Users },
  { id: "odenishler", label: "Ödənişlər", icon: Wallet },
  { id: "davamiyyet", label: "Davamiyyət", icon: ClipboardCheck },
  { id: "testler", label: "Testlər", icon: FileQuestion },
];

const AZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

function paymentMonthOptions() {
  const now = new Date();
  const opts = [];
  for (let i = -3; i <= 9; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    opts.push(`${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }
  return opts;
}

function useCollection(tenantId, node) {
  const [items, setItems] = useState({});
  useEffect(() => {
    if (!tenantId) return;
    const r = ref(db, tenantPath(tenantId, node));
    const unsub = onValue(r, (snap) => setItems(snap.val() || {}));
    return () => unsub();
  }, [tenantId, node]);
  return items;
}

function useProfil(tenantId) {
  const [profil, setProfil] = useState(null);
  useEffect(() => {
    if (!tenantId) return;
    const r = ref(db, tenantPath(tenantId, "profil"));
    const unsub = onValue(r, (snap) => setProfil(snap.val()));
    return () => unsub();
  }, [tenantId]);
  return profil;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("qruplar");
  const profil = useProfil(session?.tenantId);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate("/giris");
      return;
    }
    setSession(s);
  }, [navigate]);

  if (!session) return null;

  function handleLogout() {
    clearSession();
    navigate("/");
  }

  const expired = profil && profil.access_until && Date.now() > profil.access_until;

  if (expired) {
    return <TrialExpired ad={profil.ad} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink text-white">
        <div className="container-px max-w-7xl mx-auto flex items-center justify-between py-5">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center text-ink">
              <GraduationCap size={16} />
            </span>
            Repetitor
            <span className="text-white/40 font-body text-sm font-normal ml-2">/ {session.profile?.ad}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <LogOut size={15} /> Çıxış
          </button>
        </div>
        {/* Mobil: rəngli kvadrat/pill grid */}
        <div className="container-px max-w-7xl mx-auto grid grid-cols-2 gap-2 py-3 sm:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-full text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-gold text-ink shadow-[0_6px_20px_-6px_rgba(232,176,75,0.6)]"
                  : "bg-white/[0.06] text-white/70 border border-white/10"
              } ${TABS.length % 2 === 1 && t.id === TABS[TABS.length - 1].id ? "col-span-2" : ""}`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Desktop: üfüqi tab sırası */}
        <div className="container-px max-w-7xl mx-auto hidden sm:flex gap-1 overflow-x-auto pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id ? "border-gold text-white" : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="container-px max-w-7xl mx-auto py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "qruplar" && <QruplarTab tenantId={session.tenantId} />}
            {tab === "sagirdler" && <SagirdlerTab tenantId={session.tenantId} />}
            {tab === "odenishler" && <OdenishlerTab tenantId={session.tenantId} />}
            {tab === "davamiyyet" && <DavamiyyetTab tenantId={session.tenantId} />}
            {tab === "testler" && <TestlerTab tenantId={session.tenantId} fenn={session.profile?.fenn} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function TrialExpired({ ad, onLogout }) {
  const waMessage = encodeURIComponent(`Salam, mən ${ad || "repetitor"}. Repetitor CRM sınaq müddətim bitib, abunə olmaq istəyirəm.`);
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center container-px py-16 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl animate-floaty" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-coral/10 blur-3xl animate-floaty2" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-coral/10 border border-coral/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="text-coral" size={26} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-white mb-3">Sınaq müddətin bitib</h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          {ad ? `${ad}, ` : ""}7 günlük pulsuz sınaq müddətin başa çatıb. Davam etmək üçün abunə ol —
          şagirdlərinin, qruplarının və ödənişlərinin bütün datası qorunub saxlanılır.
        </p>
        <a
          href={`https://wa.me/994552107111?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center !py-3 mb-3"
        >
          WhatsApp ilə əlaqə saxla
        </a>
        <button onClick={onLogout} className="text-white/40 hover:text-white text-sm transition-colors">
          Çıxış et
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slateink">{title}</h2>
        {desc && <p className="text-slateink/50 text-sm mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

/* ---------------- QRUPLAR ---------------- */
function groupLabel(g) {
  return `${g.gunler || "?"} · ${g.saat || "?"}${g.seviyye ? ` (${g.seviyye})` : ""}`;
}

function QruplarTab({ tenantId }) {
  const groups = useCollection(tenantId, "qruplar");
  const students = useCollection(tenantId, "sagirdler");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ gunler: "", saat: "", seviyye: "", forma: "Online", status: "boş" });

  async function addGroup(e) {
    e.preventDefault();
    if (!form.gunler || !form.saat || !form.seviyye) return;
    const r = push(ref(db, tenantPath(tenantId, "qruplar")));
    await set(r, form);
    setForm({ gunler: "", saat: "", seviyye: "", forma: "Online", status: "boş" });
    setOpen(false);
  }

  async function cycleStatus(id, current) {
    const order = ["boş", "az", "dolub"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    await set(ref(db, tenantPath(tenantId, "qruplar", id, "status")), next);
  }

  async function del(id) {
    await remove(ref(db, tenantPath(tenantId, "qruplar", id)));
  }

  const list = Object.entries(groups);
  const studentList = Object.entries(students);

  return (
    <div>
      <SectionHeader title="Qruplar" desc="Gün, saat və doluluq statusu — statusa klikləyib dəyiş.">
        <button onClick={() => setOpen((v) => !v)} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus size={16} /> Qrup əlavə et
        </button>
      </SectionHeader>

      {open && (
        <form onSubmit={addGroup} className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <Input label="Günlər" value={form.gunler} onChange={(v) => setForm({ ...form, gunler: v })} placeholder="B.e-Ç.ax-Cümə" />
          <Input label="Saat" value={form.saat} onChange={(v) => setForm({ ...form, saat: v })} placeholder="14:30–16:30" />
          <Input label="Səviyyə" value={form.seviyye} onChange={(v) => setForm({ ...form, seviyye: v })} placeholder="8-9" />
          <Select label="Forma" value={form.forma} onChange={(v) => setForm({ ...form, forma: v })} options={["Online", "Canlı"]} />
          <button type="submit" className="btn-primary !py-3 justify-center text-sm">Yadda saxla</button>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState text="Hələ qrup yoxdur. İlk qrupunu əlavə et." />
      ) : (
        <div className="space-y-3">
          {list.map(([id, g]) => {
            const members = studentList.filter(([, s]) => s.qrupId === id);
            return (
              <div key={id} className="card-dark overflow-hidden">
                <div className="flex items-center gap-3 p-1">
                  <div className="flex-1" onClick={() => cycleStatus(id, g.status)}>
                    <div className="cursor-pointer">
                      <StatusBoard groups={[g]} compact />
                    </div>
                  </div>
                  <button onClick={() => del(id)} className="text-white/25 hover:text-coral transition-colors p-2 mr-2">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="px-4 pb-3 pt-1 flex flex-wrap items-center gap-1.5 border-t border-white/10 mt-1">
                  <span className="text-[11px] text-white/35 font-mono uppercase mr-1">
                    {members.length} şagird:
                  </span>
                  {members.length === 0 ? (
                    <span className="text-xs text-white/25">Hələ şagird əlavə olunmayıb</span>
                  ) : (
                    members.map(([sid, s]) => (
                      <span key={sid} className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-white/70">
                        {s.ad}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- ŞAGİRDLƏR ---------------- */
function SagirdlerTab({ tenantId }) {
  const students = useCollection(tenantId, "sagirdler");
  const groups = useCollection(tenantId, "qruplar");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ad: "", sinif: "", valideyn: "", qeyd: "", qrupId: "" });
  const [openStudentId, setOpenStudentId] = useState(null);

  const groupList = Object.entries(groups);

  async function addStudent(e) {
    e.preventDefault();
    if (!form.ad) return;
    const r = push(ref(db, tenantPath(tenantId, "sagirdler")));
    await set(r, { ...form, elave_tarixi: Date.now() });
    setForm({ ad: "", sinif: "", valideyn: "", qeyd: "", qrupId: "" });
    setOpen(false);
  }

  async function setStudentGroup(studentId, qrupId) {
    await set(ref(db, tenantPath(tenantId, "sagirdler", studentId, "qrupId")), qrupId);
  }

  async function del(id) {
    await remove(ref(db, tenantPath(tenantId, "sagirdler", id)));
  }

  const list = Object.entries(students);

  if (openStudentId && students[openStudentId]) {
    return (
      <StudentDetail
        tenantId={tenantId}
        studentId={openStudentId}
        student={students[openStudentId]}
        onBack={() => setOpenStudentId(null)}
      />
    );
  }

  return (
    <div>
      <SectionHeader title="Şagirdlər" desc={`Cəmi: ${list.length} şagird`}>
        <button onClick={() => setOpen((v) => !v)} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus size={16} /> Şagird əlavə et
        </button>
      </SectionHeader>

      {open && (
        <form onSubmit={addStudent} className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <Input label="Ad Soyad" value={form.ad} onChange={(v) => setForm({ ...form, ad: v })} placeholder="Nihad Əliyev" />
          <Input label="Sinif" value={form.sinif} onChange={(v) => setForm({ ...form, sinif: v })} placeholder="9-A" />
          <label className="block">
            <span className="text-xs font-medium text-slateink/50 mb-1.5 block">Qrup</span>
            <select
              value={form.qrupId}
              onChange={(e) => setForm({ ...form, qrupId: e.target.value })}
              className="w-full bg-paper border border-black/10 rounded-lg px-3 py-2.5 text-sm text-slateink focus:outline-none focus:border-gold/60 transition-all"
            >
              <option value="">Qrup seç (ixtiyari)</option>
              {groupList.map(([id, g]) => (
                <option key={id} value={id}>{groupLabel(g)}</option>
              ))}
            </select>
          </label>
          <Input label="Valideyn nömrəsi" value={form.valideyn} onChange={(v) => setForm({ ...form, valideyn: v })} placeholder="055 xxx xx xx" />
          <button type="submit" className="btn-primary !py-3 justify-center text-sm">Yadda saxla</button>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState text="Hələ şagird yoxdur. İlk şagirdini əlavə et." />
      ) : (
        <div className="card-dark divide-y divide-white/10">
          {list.map(([id, s]) => (
            <div key={id} className="flex items-center justify-between gap-3 px-5 py-4">
              <button onClick={() => setOpenStudentId(id)} className="min-w-0 text-left flex-1">
                <p className="font-medium text-white hover:text-gold transition-colors">{s.ad}</p>
                <p className="text-xs text-white/45 truncate">{s.sinif} {s.valideyn && `· ${s.valideyn}`} {s.qeyd && `· ${s.qeyd}`}</p>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={s.qrupId || ""}
                  onChange={(e) => setStudentGroup(id, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-gold/60 max-w-[160px]"
                >
                  <option value="" className="text-slateink">Qrupsuz</option>
                  {groupList.map(([gid, g]) => (
                    <option key={gid} value={gid} className="text-slateink">{groupLabel(g)}</option>
                  ))}
                </select>
                <button onClick={() => del(id)} className="text-white/25 hover:text-coral transition-colors p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentDetail({ tenantId, studentId, student, onBack }) {
  const neticeler = useCollection(tenantId, `sagirdler/${studentId}/neticeler`);
  const results = Object.entries(neticeler).sort((a, b) => (a[1].tarix || 0) - (b[1].tarix || 0));
  const [openResultId, setOpenResultId] = useState(null);

  if (openResultId && neticeler[openResultId]) {
    const r = neticeler[openResultId];
    return (
      <div>
        <button onClick={() => setOpenResultId(null)} className="flex items-center gap-1.5 text-slateink/60 hover:text-slateink text-sm mb-6">
          <ChevronLeft size={16} /> Geri
        </button>
        <div className="card-dark p-6 text-center mb-6">
          <p className="text-white/50 text-sm font-mono uppercase tracking-wide mb-2">{r.baslik}</p>
          <p className="font-display text-4xl font-bold text-gold mb-1">{r.bal}/{r.cemi}</p>
          <p className="text-white/60 text-sm">{r.faiz}% · {new Date(r.tarix).toLocaleString("az-AZ")}</p>
        </div>
        <div className="space-y-3">
          {(r.cavablar || []).map((c, i) => (
            <div key={i} className="card p-4">
              <p className="font-medium text-slateink mb-2">{i + 1}. {c.sual}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {(c.secimler || []).map((opt, oi) => {
                  const isRight = oi === c.duzgun;
                  const isPicked = oi === c.secilen;
                  return (
                    <div
                      key={oi}
                      className={`text-sm rounded-lg px-3 py-2 border flex items-center justify-between gap-2 ${
                        isRight ? "border-emerald/40 bg-emerald/5" : isPicked ? "border-coral/40 bg-coral/5" : "border-black/10"
                      }`}
                    >
                      <span className="text-slateink/80">{String.fromCharCode(65 + oi)}) {opt}</span>
                      {isRight && <Check size={14} className="text-emerald shrink-0" />}
                      {isPicked && !isRight && <X size={14} className="text-coral shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-slateink/60 hover:text-slateink text-sm mb-6">
        <ChevronLeft size={16} /> Geri
      </button>
      <SectionHeader title={student.ad} desc={`${student.sinif || "—"} · İmtahan tarixçəsi`} />

      {results.length === 0 ? (
        <EmptyState text="Bu şagird hələ heç bir imtahan verməyib." />
      ) : (
        <>
          <div className="card-dark p-5 mb-6 flex items-center gap-3">
            <TrendingUp size={20} className="text-gold shrink-0" />
            <p className="text-white/70 text-sm">
              {results.length} imtahan verib · Orta nəticə:{" "}
              <span className="text-gold font-semibold">
                {Math.round(results.reduce((s, [, r]) => s + (r.faiz || 0), 0) / results.length)}%
              </span>
            </p>
          </div>
          <div className="card-dark divide-y divide-white/10">
            {results.map(([id, r]) => (
              <button key={id} onClick={() => setOpenResultId(id)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div>
                  <p className="text-white font-medium text-sm">{r.baslik}</p>
                  <p className="text-white/40 text-xs font-mono">{new Date(r.tarix).toLocaleString("az-AZ")}</p>
                </div>
                <span className={`text-sm font-mono font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                  r.faiz >= 60 ? "bg-emerald/15 text-emerald" : "bg-coral/15 text-coral"
                }`}>
                  {r.bal}/{r.cemi} · {r.faiz}%
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- ÖDƏNİŞLƏR ---------------- */
function OdenishlerTab({ tenantId }) {
  const payments = useCollection(tenantId, "odenishler");
  const students = useCollection(tenantId, "sagirdler");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sagird: "", mebleg: "", ay: "", status: "odenilib" });

  const studentNames = Object.values(students).map((s) => s.ad).filter(Boolean);
  const months = paymentMonthOptions();

  async function addPayment(e) {
    e.preventDefault();
    if (!form.sagird || !form.mebleg || !form.ay) return;
    const r = push(ref(db, tenantPath(tenantId, "odenishler")));
    await set(r, { ...form, tarix: Date.now() });
    setForm({ sagird: "", mebleg: "", ay: "", status: "odenilib" });
    setOpen(false);
  }

  async function toggleStatus(id, current) {
    await set(ref(db, tenantPath(tenantId, "odenishler", id, "status")), current === "odenilib" ? "borclu" : "odenilib");
  }

  async function del(id) {
    await remove(ref(db, tenantPath(tenantId, "odenishler", id)));
  }

  const list = Object.entries(payments).sort((a, b) => (b[1].tarix || 0) - (a[1].tarix || 0));
  const totalPeriod = list.reduce((sum, [, p]) => (p.status === "odenilib" ? sum + Number(p.mebleg || 0) : sum), 0);

  const byMonth = {};
  list.forEach(([, p]) => {
    if (p.status !== "odenilib" || !p.ay) return;
    byMonth[p.ay] = (byMonth[p.ay] || 0) + Number(p.mebleg || 0);
  });
  const monthlyReport = Object.entries(byMonth).sort((a, b) => months.indexOf(b[0]) - months.indexOf(a[0]));

  return (
    <div>
      <div className="card-dark p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-wide">Dövr ərzində ümumi gəlir</p>
          <p className="font-display text-3xl font-semibold text-gold mt-1">{totalPeriod} AZN</p>
        </div>
        <Wallet className="text-gold/30" size={40} />
      </div>

      <SectionHeader title="Ödənişlər" desc={`${list.length} qeyd`}>
        <button onClick={() => setOpen((v) => !v)} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus size={16} /> Ödəniş qeyd et
        </button>
      </SectionHeader>

      {open && (
        <form onSubmit={addPayment} className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Select
            label="Şagird"
            value={form.sagird}
            onChange={(v) => setForm({ ...form, sagird: v })}
            options={studentNames}
            placeholder={studentNames.length ? "Şagird seç" : "Əvvəlcə şagird əlavə et"}
          />
          <Input label="Məbləğ (AZN)" value={form.mebleg} onChange={(v) => setForm({ ...form, mebleg: v })} placeholder="80" />
          <Select label="Ay" value={form.ay} onChange={(v) => setForm({ ...form, ay: v })} options={months} placeholder="Ay seç" />
          <button type="submit" className="btn-primary !py-3 justify-center text-sm">Yadda saxla</button>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState text="Hələ ödəniş qeydi yoxdur." />
      ) : (
        <div className="card-dark divide-y divide-white/10 mb-8">
          {list.map(([id, p]) => (
            <div key={id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-white">{p.sagird}</p>
                <p className="text-xs text-white/45 font-mono">{p.mebleg} AZN · {p.ay}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(id, p.status)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                    p.status === "odenilib" ? "bg-emerald/15 text-emerald" : "bg-coral/15 text-coral"
                  }`}
                >
                  {p.status === "odenilib" ? <Check size={12} /> : <X size={12} />}
                  {p.status === "odenilib" ? "Ödənilib" : "Borclu"}
                </button>
                <button onClick={() => del(id)} className="text-white/25 hover:text-coral transition-colors p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {monthlyReport.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-slateink mb-3">Aylıq gəlir hesabatı</h3>
          <div className="card-dark divide-y divide-white/10">
            {monthlyReport.map(([ay, sum]) => (
              <div key={ay} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-white/60">{ay}</span>
                <span className="font-mono text-sm font-semibold text-emerald">{sum} AZN</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- DAVAMİYYƏT ---------------- */
function DavamiyyetTab({ tenantId }) {
  const students = useCollection(tenantId, "sagirdler");
  const records = useCollection(tenantId, "davamiyyet"); // { [sagirdId]: { [YYYY-MM-DD]: true } }
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const studentList = Object.entries(students);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  function dateKey(day) {
    return `${monthPrefix}-${String(day).padStart(2, "0")}`;
  }

  async function toggle(sagirdId, day) {
    const key = dateKey(day);
    const current = !!records[sagirdId]?.[key];
    await set(ref(db, tenantPath(tenantId, "davamiyyet", sagirdId, key)), !current);
  }

  function monthCount(sagirdId) {
    const rec = records[sagirdId] || {};
    return Object.entries(rec).filter(([k, v]) => v && k.startsWith(monthPrefix)).length;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slateink">Davamiyyət</h2>
          <p className="text-slateink/50 text-sm mt-1">Kvadrata bas — dərsə gəlib-gəlməməni işarələ</p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="bg-paper border border-black/10 rounded-lg px-3 py-2.5 text-sm text-slateink focus:outline-none focus:border-gold/60 transition-all"
        >
          {AZ_MONTHS.map((m, i) => (
            <option key={m} value={i}>{m} {year}</option>
          ))}
        </select>
      </div>

      {studentList.length === 0 ? (
        <EmptyState text="Əvvəlcə şagird əlavə et ki, davamiyyəti izləyə biləsən." />
      ) : (
        <div className="card-dark overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium text-white/50 sticky left-0 bg-ink">Şagird</th>
                {days.map((d) => (
                  <th key={d} className="px-1.5 py-3 font-mono text-[10px] text-white/30 text-center">{d}</th>
                ))}
                <th className="px-3 py-3 font-medium text-white/50 text-right whitespace-nowrap">Ay ərzində</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map(([id, s]) => (
                <tr key={id} className="border-b border-white/10 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-white whitespace-nowrap sticky left-0 bg-ink">{s.ad}</td>
                  {days.map((d) => {
                    const checked = !!records[id]?.[dateKey(d)];
                    return (
                      <td key={d} className="px-1.5 py-2.5 text-center">
                        <button
                          onClick={() => toggle(id, d)}
                          aria-label={checked ? "Gəldi" : "Gəlmədi"}
                          className={`w-5 h-5 rounded-md border transition-colors ${
                            checked ? "bg-emerald border-emerald" : "bg-white/5 border-white/15 hover:border-emerald/50"
                          }`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-right font-mono text-xs font-semibold text-emerald whitespace-nowrap">
                    {monthCount(id)} dərs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- TESTLƏR ---------------- */
function TestlerTab({ tenantId, fenn }) {
  const tests = useCollection(tenantId, "testler");
  const [sinif, setSinif] = useState("");
  const [sualSayi, setSualSayi] = useState(60);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const list = Object.entries(tests).sort((a, b) => (b[1].yaradilib || 0) - (a[1].yaradilib || 0));

  async function handleGenerate(e) {
    e.preventDefault();
    if (!sinif || !fenn) {
      setError("Sinif daxil et.");
      return;
    }
    setLoading(true);
    setError("");
    setProgress({ done: 0, total: Number(sualSayi) || 60 });
    try {
      const suallar = await generateTest({
        fenn,
        sinif,
        sualSayi: Number(sualSayi) || 60,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      const r = push(ref(db, tenantPath(tenantId, "testler")));
      await set(r, {
        baslik: `${sinif}-ci sinif ${fenn} — ${suallar.length} sual`,
        sinif,
        fenn,
        yaradilib: Date.now(),
        suallar,
      });
      setOpenId(r.key);
      setSinif("");
    } catch (err) {
      setError(err.message || "AI test hazırlaya bilmədi. Yenidən sına.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  async function del(id) {
    await remove(ref(db, tenantPath(tenantId, "testler", id)));
    if (openId === id) setOpenId(null);
  }

  if (openId && tests[openId]) {
    return <TestDetail test={tests[openId]} tenantId={tenantId} testId={openId} onBack={() => setOpenId(null)} onDelete={() => del(openId)} />;
  }

  return (
    <div>
      <SectionHeader title="Testlər" desc={fenn ? `Fənn: ${fenn} (sənin qeydiyyat fənnin)` : "Testlər"}>
        {list.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-emerald text-white hover:bg-emerald/90 transition-colors"
            >
              <GraduationCap size={16} /> Sınaq imtahanı
            </button>
            {pickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 card p-2 z-20 shadow-2xl">
                <p className="text-xs text-slateink/40 px-3 pt-1 pb-2">Hansı testlə imtahan keçirəcəksən?</p>
                <div className="max-h-72 overflow-y-auto">
                  {list.map(([id, t]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setPickerOpen(false);
                        setOpenId(id);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-paper transition-colors text-sm text-slateink"
                    >
                      {t.baslik}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionHeader>

      <form onSubmit={handleGenerate} className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-slateink/70 text-sm font-medium">
          <Sparkles size={16} className="text-gold" /> AI ilə test hazırla
        </div>
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <Input label="Sinif" value={sinif} onChange={setSinif} placeholder="7" />
          <Input label="Sual sayı" value={String(sualSayi)} onChange={(v) => setSualSayi(v.replace(/\D/g, ""))} placeholder="60" />
          <button type="submit" disabled={loading} className="btn-primary !py-3 justify-center text-sm">
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Test hazırla"}
          </button>
        </div>
        <p className="text-xs text-slateink/40 mt-3">
          Fənn avtomatik sənin qeydiyyat fənnindən götürülür ({fenn || "—"}) — dəyişmək olmaz.
        </p>
        {progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slateink/50 mb-1.5">
              <span>Hazırlanır...</span>
              <span className="font-mono">{progress.done} / {progress.total}</span>
            </div>
            <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500"
                style={{ width: `${Math.min(100, (progress.done / progress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {error && <p className="text-coral text-sm mt-3 bg-coral/10 rounded-lg px-3 py-2">{error}</p>}
      </form>

      {list.length === 0 ? (
        <EmptyState text="Hələ test yaradılmayıb. Yuxarıdan ilk testini AI ilə hazırla." />
      ) : (
        <div className="card-dark divide-y divide-white/10">
          {list.map(([id, t]) => (
            <div key={id} className="flex items-center justify-between px-5 py-4">
              <button onClick={() => setOpenId(id)} className="text-left min-w-0">
                <p className="font-medium text-white truncate">{t.baslik}</p>
                <p className="text-xs text-white/45 mt-0.5">{t.suallar?.length || 0} sual</p>
              </button>
              <button onClick={() => del(id)} className="text-white/25 hover:text-coral transition-colors p-2 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestDetail({ test, tenantId, testId, onBack, onDelete }) {
  const neticeler = useCollection(tenantId, `testler/${testId}/neticeler`);
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/imtahan/${tenantId}/${testId}`;
  const results = Object.entries(neticeler).sort((a, b) => (b[1].tarix || 0) - (a[1].tarix || 0));

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: test.baslik, text: "İmtahan linki", url: link });
        return;
      } catch {
        // istifadəçi ləğv etdi, kopyalamaya keç
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Linki kopyala:", link);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 no-print flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slateink/60 hover:text-slateink text-sm">
          <ChevronLeft size={16} /> Geri
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={shareLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-emerald text-white hover:bg-emerald/90 transition-colors"
          >
            <Share2 size={16} />
            {copied ? "Kopyalandı!" : (
              <>
                <span className="sm:hidden">İmtahan linki</span>
                <span className="hidden sm:inline">Sınaq imtahanının linkini paylaş</span>
              </>
            )}
          </button>
          <button onClick={() => window.print()} className="btn-primary !py-2.5 !px-5 text-sm">
            <Printer size={16} /> Çap et
          </button>
          <button onClick={onDelete} className="text-slateink/30 hover:text-coral transition-colors p-2">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="card-dark p-5 mb-6 no-print">
          <p className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-gold" /> Nəticələr ({results.length})
          </p>
          <div className="divide-y divide-white/10">
            {results.map(([sid, r]) => (
              <div key={sid} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium text-sm">{r.ad}</p>
                  <p className="text-white/40 text-xs font-mono">{new Date(r.tarix).toLocaleString("az-AZ")}</p>
                </div>
                <span className={`text-sm font-mono font-semibold px-2.5 py-1 rounded-full ${
                  r.faiz >= 60 ? "bg-emerald/15 text-emerald" : "bg-coral/15 text-coral"
                }`}>
                  {r.bal}/{r.cemi} · {r.faiz}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="printable-test">
        <h2 className="font-display text-xl font-semibold text-slateink mb-1">{test.baslik}</h2>
        <p className="text-xs text-slateink/40 font-mono mb-6 no-print">
          Cavab açarı yalnız bu ekranda görünür — çap edəndə gizlənir.
        </p>
        <div className="space-y-5">
          {(test.suallar || []).map((q, i) => (
            <div key={i} className="card p-4">
              <p className="font-medium text-slateink mb-3">{i + 1}. {q.sual}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {(q["seçimler"] || q.secimler || []).map((opt, oi) => {
                  const isCorrect = oi === q.duzgun;
                  return (
                    <div
                      key={oi}
                      className={`text-sm rounded-lg px-3 py-2 border flex items-center justify-between gap-2 ${
                        isCorrect ? "border-emerald/40 bg-emerald/5 correct-answer" : "border-black/10"
                      }`}
                    >
                      <span className="text-slateink/80">
                        {String.fromCharCode(65 + oi)}) {opt}
                      </span>
                      {isCorrect && <Check size={14} className="text-emerald shrink-0 no-print" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SHARED UI ---------------- */
function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slateink/50 mb-1.5 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-paper border border-black/10 rounded-lg px-3 py-2.5 text-sm text-slateink
        focus:outline-none focus:border-gold/60 transition-all"
      />
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slateink/50 mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper border border-black/10 rounded-lg px-3 py-2.5 text-sm text-slateink
        focus:outline-none focus:border-gold/60 transition-all"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ text }) {
  return (
    <div className="card-dark p-12 text-center">
      <p className="text-white/35 text-sm">{text}</p>
    </div>
  );
}
