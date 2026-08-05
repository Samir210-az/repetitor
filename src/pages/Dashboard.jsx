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
function QruplarTab({ tenantId }) {
  const groups = useCollection(tenantId, "qruplar");
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
        <div className="space-y-2">
          {list.map(([id, g]) => (
            <div key={id} className="flex items-center gap-3">
              <div className="flex-1" onClick={() => cycleStatus(id, g.status)}>
                <div className="cursor-pointer">
                  <StatusBoard groups={[g]} />
                </div>
              </div>
              <button onClick={() => del(id)} className="text-slateink/30 hover:text-coral transition-colors p-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- ŞAGİRDLƏR ---------------- */
function SagirdlerTab({ tenantId }) {
  const students = useCollection(tenantId, "sagirdler");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ad: "", sinif: "", valideyn: "", qeyd: "" });

  async function addStudent(e) {
    e.preventDefault();
    if (!form.ad) return;
    const r = push(ref(db, tenantPath(tenantId, "sagirdler")));
    await set(r, { ...form, elave_tarixi: Date.now() });
    setForm({ ad: "", sinif: "", valideyn: "", qeyd: "" });
    setOpen(false);
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
          <Input label="Valideyn nömrəsi" value={form.valideyn} onChange={(v) => setForm({ ...form, valideyn: v })} placeholder="055 xxx xx xx" />
          <Input label="Qeyd" value={form.qeyd} onChange={(v) => setForm({ ...form, qeyd: v })} placeholder="İxtiyari" />
          <button type="submit" className="btn-primary !py-3 justify-center text-sm">Yadda saxla</button>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState text="Hələ şagird yoxdur. İlk şagirdini əlavə et." />
      ) : (
        <div className="card divide-y divide-black/5">
          {list.map(([id, s]) => (
            <div key={id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-slateink">{s.ad}</p>
                <p className="text-xs text-slateink/50">{s.sinif} {s.valideyn && `· ${s.valideyn}`} {s.qeyd && `· ${s.qeyd}`}</p>
              </div>
              <button onClick={() => del(id)} className="text-slateink/30 hover:text-coral transition-colors p-2">
                <Trash2 size={16} />
              </button>
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sagird: "", mebleg: "", ay: "", status: "odenilib" });

  async function addPayment(e) {
    e.preventDefault();
    if (!form.sagird || !form.mebleg) return;
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

  const list = Object.entries(payments);
  const total = list.reduce((sum, [, p]) => (p.status === "odenilib" ? sum + Number(p.mebleg || 0) : sum), 0);

  return (
    <div>
      <SectionHeader title="Ödənişlər" desc={`Bu ay toplam: ${total} AZN`}>
        <button onClick={() => setOpen((v) => !v)} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus size={16} /> Ödəniş qeyd et
        </button>
      </SectionHeader>

      {open && (
        <form onSubmit={addPayment} className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Input label="Şagird" value={form.sagird} onChange={(v) => setForm({ ...form, sagird: v })} placeholder="Nihad Əliyev" />
          <Input label="Məbləğ (AZN)" value={form.mebleg} onChange={(v) => setForm({ ...form, mebleg: v })} placeholder="80" />
          <Input label="Ay" value={form.ay} onChange={(v) => setForm({ ...form, ay: v })} placeholder="Avqust 2026" />
          <button type="submit" className="btn-primary !py-3 justify-center text-sm">Yadda saxla</button>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState text="Hələ ödəniş qeydi yoxdur." />
      ) : (
        <div className="card divide-y divide-black/5">
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
    </div>
  );
}

/* ---------------- DAVAMİYYƏT ---------------- */
function DavamiyyetTab({ tenantId }) {
  const records = useCollection(tenantId, "davamiyyet");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sagird: "", tarix: "", geldi: true });

  async function addRecord(e) {
    e.preventDefault();
    if (!form.sagird || !form.tarix) return;
    const r = push(ref(db, tenantPath(tenantId, "davamiyyet")));
    await set(r, form);
    setForm({ sagird: "", tarix: "", geldi: true });
    setOpen(false);
  }

  async function del(id) {
    await remove(ref(db, tenantPath(tenantId, "davamiyyet", id)));
  }

  const list = Object.entries(records).sort((a, b) => (b[1].tarix || "").localeCompare(a[1].tarix || ""));

  return (
    <div>
      <SectionHeader title="Davamiyyət" desc="Dərsə gəlib-gəlməmə qeydiyyatı">
        <button onClick={() => setOpen((v) => !v)} className="btn-primary !py-2.5 !px-5 text-sm">
          <Plus size={16} /> Qeyd əlavə et
        </button>
      </SectionHeader>

      {open && (
        <form onSubmit={addRecord} className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Input label="Şagird" value={form.sagird} onChange={(v) => setForm({ ...form, sagird: v })} placeholder="Nihad Əliyev" />
          <Input label="Tarix" value={form.tarix} onChange={(v) => setForm({ ...form, tarix: v })} placeholder="2026-08-05" />
          <Select
            label="Vəziyyət"
            value={form.geldi ? "geldi" : "gelmedi"}
            onChange={(v) => setForm({ ...form, geldi: v === "geldi" })}
            options={["geldi", "gelmedi"]}
          />
          <button type="submit" className="btn-primary !py-3 justify-center text-sm">Yadda saxla</button>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState text="Hələ davamiyyət qeydi yoxdur." />
      ) : (
        <div className="card divide-y divide-black/5">
          {list.map(([id, r]) => (
            <div key={id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-slateink">{r.sagird}</p>
                <p className="text-xs text-slateink/50 font-mono">{r.tarix}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.geldi ? "bg-emerald/10 text-emerald" : "bg-coral/10 text-coral"}`}>
                  {r.geldi ? "Gəldi" : "Gəlmədi"}
                </span>
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

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slateink/50 mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper border border-black/10 rounded-lg px-3 py-2.5 text-sm text-slateink
        focus:outline-none focus:border-gold/60 transition-all"
      >
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
