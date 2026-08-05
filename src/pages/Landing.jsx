import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, CalendarClock, Wallet, ClipboardCheck, ArrowRight,
  ShieldCheck, Sparkles, Lock,
} from "lucide-react";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import StatusBoard from "../components/StatusBoard.jsx";

const HERO_IMG = "https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?auto=format&fit=crop&w=1800&q=80";
const DESK_IMG = "https://images.unsplash.com/photo-1769794371055-54436b54577e?auto=format&fit=crop&w=1400&q=80";

const demoGroups = [
  { gunler: "B.e - Ç.ax - Cümə", saat: "14:30–16:30", seviyye: "8-9", forma: "Online", status: "dolub" },
  { gunler: "B.e - Ç.ax - Cümə", saat: "17:00–19:00", seviyye: "8-9", forma: "Canlı", status: "dolub" },
  { gunler: "Ç.a - Cümə", saat: "16:00–17:30", seviyye: "10-11", forma: "Online", status: "az" },
  { gunler: "B.e - Ç.a", saat: "18:00–19:30", seviyye: "10-11", forma: "Canlı", status: "boş" },
];

const features = [
  {
    icon: Users,
    title: "Şagird kartları",
    desc: "Hər şagirdin əlaqəsi, sinfi, valideyn nömrəsi və qeydləri bir kartda — axtarış bir saniyə.",
  },
  {
    icon: CalendarClock,
    title: "Canlı qrup lövhəsi",
    desc: "Gün, saat və səviyyəyə görə qruplar — Dolub / Az yer / Boş statusu real vaxtda yenilənir.",
  },
  {
    icon: Wallet,
    title: "Ödəniş izləmə",
    desc: "Kim ödəyib, kim borcludur — aylıq gəlir və gecikmiş ödənişlər bir baxışda.",
  },
  {
    icon: ClipboardCheck,
    title: "Davamiyyət",
    desc: "Dərsə gəlib-gəlməmə qeydiyyatı, aylıq davamiyyət faizi hər şagird üçün avtomatik hesablanır.",
  },
];

const steps = [
  { n: "01", title: "Qeydiyyatdan keç", desc: "Adını, fənnini və giriş PIN-ini təyin et — 1 dəqiqə çəkir." },
  { n: "02", title: "Qruplarını qur", desc: "Gün, saat və səviyyə üzrə qruplarını əlavə et, doluluq statusunu işarələ." },
  { n: "03", title: "İdarə et", desc: "Şagird əlavə et, ödəniş qeyd et, davamiyyəti izlə — hamısı bir yerdə." },
];

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-paper">
      <Nav />

      {/* HERO */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Açıq kitablar — dərs hazırlığı"
            className="w-full h-[130%] object-cover opacity-45"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
        </motion.div>

        {/* floating accent shapes */}
        <div className="absolute top-24 right-[8%] w-24 h-24 rounded-full bg-gold/20 blur-2xl animate-floaty" />
        <div className="absolute bottom-32 right-[20%] w-32 h-32 rounded-full bg-emerald/20 blur-2xl animate-floaty2" />
        <div className="absolute top-1/3 left-[6%] w-16 h-16 rounded-full bg-lilac/20 blur-xl animate-floaty2" />

        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="relative z-10 h-full container-px max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center"
        >
          <div className="pt-16 lg:pt-0">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-xs font-mono tracking-wide uppercase text-gold/90 bg-gold/10 border border-gold/20 rounded-full px-3 py-1.5 mb-6"
            >
              <Sparkles size={12} /> Repetitorlar üçün idarəetmə sistemi
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] text-white font-semibold"
            >
              Dərslərini, şagirdlərini,<br />
              gəlirini — <span className="text-gold italic">bir dəftərdə</span> topla.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-white/70 text-lg max-w-lg"
            >
              Kağız dəftər və Excel-dən yorulmusan? Qruplarını, şagirdlərini,
              ödənişlərini və davamiyyəti tək bir ekrandan izlə — hər dəyişiklik
              real vaxtda yenilənir.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link to="/qeydiyyat" className="btn-primary">
                Pulsuz sınaq başlat <ArrowRight size={16} />
              </Link>
              <Link to="/giris" className="btn-ghost">
                Artıq hesabım var
              </Link>
            </motion.div>
          </div>

          {/* live status demo card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="hidden lg:block"
          >
            <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-display text-lg">2026–2027 qeydiyyatı</p>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald bg-emerald/10 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulseDot" /> CANLI
                </span>
              </div>
              <StatusBoard groups={demoGroups} compact />
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs font-mono tracking-widest">
          AŞAĞI SÜRÜŞDÜR
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-px max-w-7xl mx-auto py-24 lg:py-32">
        <div className="max-w-2xl mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald mb-3">Nə edir</p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-slateink">
            Hər repetitorun ehtiyacı olan 4 şey, bir yerdə
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-6 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(18,23,43,0.18)] transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center text-gold mb-5">
                <f.icon size={20} />
              </div>
              <h3 className="font-display text-lg font-semibold text-slateink mb-2">{f.title}</h3>
              <p className="text-sm text-slateink/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS + IMAGE */}
      <section className="bg-ink py-24 lg:py-32 relative overflow-hidden">
        <div className="container-px max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-gold mb-3">Necə işləyir</p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-white mb-10">
              3 addımda quraşdır, sonra unut
            </h2>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5"
                >
                  <span className="font-mono text-gold/50 text-2xl font-semibold shrink-0">{s.n}</span>
                  <div>
                    <h3 className="text-white font-display text-lg font-semibold mb-1">{s.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={DESK_IMG} alt="Dərs hazırlığı masası" className="w-full h-[420px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-[220px]">
              <ShieldCheck className="text-emerald shrink-0" size={22} />
              <p className="text-xs text-slateink/70 leading-snug">Hər repetitorun məlumatı tam ayrı və qorunur</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-px max-w-7xl mx-auto py-24 lg:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Lock className="mx-auto text-emerald mb-5" size={28} />
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-slateink max-w-xl mx-auto">
            Növbəti dərs ilinə hazır ol
          </h2>
          <p className="text-slateink/60 mt-4 max-w-md mx-auto">
            Qeydiyyat 2 dəqiqə çəkir. Kredit kartı lazım deyil.
          </p>
          <Link to="/qeydiyyat" className="btn-primary mt-8">
            İndi başla <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
