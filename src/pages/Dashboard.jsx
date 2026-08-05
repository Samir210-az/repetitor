import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, CalendarClock, Wallet, ClipboardCheck,
  LogOut, Plus, Trash2, Check, X,
} from "lucide-react";
import { db, ref, onValue, push, set, remove, tenantPath } from "../lib/firebase.js";
import { getSession, clearSession } from "../lib/session.js";
import StatusBoard from "../components/StatusBoard.jsx";

const TABS = [
  { id: "qruplar", label: "Qruplar", icon: CalendarClock },
  { id: "sagirdler", label: "Şagirdlər", icon: Users },
  { id: "odenishler", label: "Ödənişlər", icon: Wallet },
  { id: "davamiyyet", label: "Davamiyyət", icon: ClipboardCheck },
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("qruplar");

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
        <div className="container-px max-w-7xl mx-auto flex gap-1 overflow-x-auto pb-0">
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
          </motion.div>
        </AnimatePresence>
      </main>
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
              <div key={id} className="card overflow-hidden">
                <div className="flex items-center gap-3 p-1">
                  <div className="flex-1" onClick={() => cycleStatus(id, g.status)}>
                    <div className="cursor-pointer">
                      <StatusBoard groups={[g]} />
                    </div>
                  </div>
                  <button onClick={() => del(id)} className="text-slateink/30 hover:text-coral transition-colors p-2 mr-2">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="px-4 pb-3 pt-1 flex flex-wrap items-center gap-1.5 border-t border-black/5 mt-1">
                  <span className="text-[11px] text-slateink/40 font-mono uppercase mr-1">
                    {members.length} şagird:
                  </span>
                  {members.length === 0 ? (
                    <span className="text-xs text-slateink/30">Hələ şagird əlavə olunmayıb</span>
                  ) : (
                    members.map(([sid, s]) => (
                      <span key={sid} className="text-xs bg-paper border border-black/10 rounded-full px-2.5 py-1 text-slateink/70">
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
        <div className="card divide-y divide-black/5">
          {list.map(([id, s]) => (
            <div key={id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium text-slateink">{s.ad}</p>
                <p className="text-xs text-slateink/50 truncate">{s.sinif} {s.valideyn && `· ${s.valideyn}`} {s.qeyd && `· ${s.qeyd}`}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={s.qrupId || ""}
                  onChange={(e) => setStudentGroup(id, e.target.value)}
                  className="bg-paper border border-black/10 rounded-full px-3 py-1.5 text-xs text-slateink/70 focus:outline-none focus:border-gold/60 max-w-[160px]"
                >
                  <option value="">Qrupsuz</option>
                  {groupList.map(([gid, g]) => (
                    <option key={gid} value={gid}>{groupLabel(g)}</option>
                  ))}
                </select>
                <button onClick={() => del(id)} className="text-slateink/30 hover:text-coral transition-colors p-2">
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
      <div className="card p-6 mb-6 flex items-center justify-between bg-ink">
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
        <div className="card divide-y divide-black/5 mb-8">
          {list.map(([id, p]) => (
            <div key={id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-slateink">{p.sagird}</p>
                <p className="text-xs text-slateink/50 font-mono">{p.mebleg} AZN · {p.ay}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(id, p.status)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                    p.status === "odenilib" ? "bg-emerald/10 text-emerald" : "bg-coral/10 text-coral"
                  }`}
                >
                  {p.status === "odenilib" ? <Check size={12} /> : <X size={12} />}
                  {p.status === "odenilib" ? "Ödənilib" : "Borclu"}
                </button>
                <button onClick={() => del(id)} className="text-slateink/30 hover:text-coral transition-colors p-2">
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
          <div className="card divide-y divide-black/5">
            {monthlyReport.map(([ay, sum]) => (
              <div key={ay} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-slateink/70">{ay}</span>
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
        <div className="card overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/5">
                <th className="text-left px-4 py-3 font-medium text-slateink/60 sticky left-0 bg-white">Şagird</th>
                {days.map((d) => (
                  <th key={d} className="px-1.5 py-3 font-mono text-[10px] text-slateink/40 text-center">{d}</th>
                ))}
                <th className="px-3 py-3 font-medium text-slateink/60 text-right whitespace-nowrap">Ay ərzində</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map(([id, s]) => (
                <tr key={id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-slateink whitespace-nowrap sticky left-0 bg-white">{s.ad}</td>
                  {days.map((d) => {
                    const checked = !!records[id]?.[dateKey(d)];
                    return (
                      <td key={d} className="px-1.5 py-2.5 text-center">
                        <button
                          onClick={() => toggle(id, d)}
                          aria-label={checked ? "Gəldi" : "Gəlmədi"}
                          className={`w-5 h-5 rounded-md border transition-colors ${
                            checked ? "bg-emerald border-emerald" : "bg-paper border-black/15 hover:border-emerald/50"
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
    <div className="card p-12 text-center">
      <p className="text-slateink/40 text-sm">{text}</p>
    </div>
  );
}
