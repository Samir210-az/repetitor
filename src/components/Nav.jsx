import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Nav({ dark = true }) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-30 container-px max-w-7xl mx-auto flex items-center justify-between py-6">
      <Link to="/" className={`flex items-center gap-2 font-display text-xl font-semibold ${dark ? "text-white" : "text-slateink"}`}>
        <span className="w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center text-ink">
          <GraduationCap size={18} />
        </span>
        Repetitor
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to="/giris"
          className={`text-sm font-medium ${dark ? "text-white/80 hover:text-white" : "text-slateink/70 hover:text-slateink"} transition-colors`}
        >
          Daxil ol
        </Link>
        <Link to="/qeydiyyat" className="btn-primary !px-5 !py-2.5 text-sm">
          Pulsuz başla
        </Link>
      </div>
    </nav>
  );
}
