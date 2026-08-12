import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import StatusBoard from "../components/StatusBoard.jsx";
import { trackVisit } from "../lib/analytics.js";

const HERO_IMG = "https://images.pexels.com/photos/6550408/pexels-photo-6550408.jpeg?auto=compress&cs=tinysrgb&w=1800&q=80";

const demoGroups = [
  { gunler: "B.e - Ç.ax - Cümə", saat: "14:30–16:30", seviyye: "8-9", forma: "Online", status: "dolub" },
  { gunler: "Ç.a - Cümə", saat: "16:00–17:30", seviyye: "10-11", forma: "Online", status: "az" },
];

export default function Landing() {
  useEffect(() => {
    trackVisit("Ana səhifə");
  }, []);

  return (
    <div className="bg-paper">
      <Nav />

      {/* HERO — TƏK EKRAN */}
      <section className="relative min-h-[82svh] overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Açıq kitablar — dərs hazırlığı"
            className="w-full h-full object-cover opacity-45"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
        </div>

        {/* floating accent shapes */}
        <div className="absolute top-24 right-[8%] w-24 h-24 rounded-full bg-gold/20 blur-2xl animate-floaty" />
        <div className="absolute bottom-32 right-[20%] w-32 h-32 rounded-full bg-emerald/20 blur-2xl animate-floaty2" />
        <div className="absolute top-1/3 left-[6%] w-16 h-16 rounded-full bg-lilac/20 blur-xl animate-floaty2" />

        <div className="relative z-10 container-px max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start lg:items-center py-10 sm:py-14">
          <div className="pt-6 sm:pt-8 lg:pt-0">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wide uppercase text-gold/90 bg-gold/10 border border-gold/20 rounded-full px-3.5 py-2 mb-5 sm:mb-6"
            >
              <Sparkles size={14} /> REPETİTORLAR üçün idarəetmə sistemi
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.1] text-white font-semibold"
            >
              Dərslərini, şagirdlərini,<br />
              gəlirini — <span className="text-gold italic">bir dəftərdə</span> topla.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-5 sm:mt-6 text-white/70 text-base sm:text-lg max-w-lg"
            >
              Kağız dəftər və Excel-dən yorulmusan? Qruplarını, şagirdlərini,
              ödənişlərini və davamiyyəti tək bir ekrandan izlə — hər dəyişiklik
              real vaxtda yenilənir.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-7 sm:mt-9 flex flex-wrap items-center gap-4"
            >
              <Link to="/qeydiyyat" className="btn-primary text-base">
                Pulsuz sınaq başlat <ArrowRight size={16} />
              </Link>
              <Link to="/giris" className="btn-ghost text-base">
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
