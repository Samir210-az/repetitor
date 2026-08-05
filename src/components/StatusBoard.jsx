import { motion } from "framer-motion";

const STATUS_STYLE = {
  dolub: { label: "Dolub", dot: "bg-coral", text: "text-coral", bg: "bg-coral/10" },
  boş: { label: "Boş yer var", dot: "bg-emerald", text: "text-emerald", bg: "bg-emerald/10" },
  az: { label: "Az yer qalıb", dot: "bg-gold", text: "text-[#B8862F]", bg: "bg-gold/10" },
};

export default function StatusBoard({ groups = [], compact = false }) {
  return (
    <div className="space-y-2">
      {groups.map((g, i) => {
        const s = STATUS_STYLE[g.status] || STATUS_STYLE.boş;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${
              compact ? "bg-white/5 border border-white/10" : "card"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`status-dot ${s.dot}`} />
              <div className="min-w-0">
                <p className={`font-mono text-sm ${compact ? "text-white" : "text-slateink"} truncate`}>
                  {g.gunler} · {g.saat}
                </p>
                <p className={`text-xs ${compact ? "text-white/50" : "text-slateink/50"}`}>
                  {g.seviyye} sinif{g.forma ? ` · ${g.forma}` : ""}
                </p>
              </div>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
              {s.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
