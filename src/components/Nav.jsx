import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Nav({ dark = true }) {
  const navigate = useNavigate();
  const taps = useRef(0);
  const timer = useRef(null);

  function handleLogoClick(e) {
    taps.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      taps.current = 0;
    }, 1500);
    if (taps.current >= 5) {
      e.preventDefault();
      taps.current = 0;
      navigate("/master");
    }
  }

  return (
    <nav className="absolute top-0 left-0 right-0 z-30 container-px max-w-7xl mx-auto flex items-center justify-between py-4 sm:py-6">
      <Link
        to="/"
        onClick={handleLogoClick}
        className={`flex items-center gap-2.5 font-display text-2xl sm:text-3xl font-bold tracking-wide uppercase select-none ${dark ? "text-white" : "text-slateink"}`}
      >
        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/90 flex items-center justify-center text-ink shrink-0">
          <GraduationCap size={20} />
        </span>
        REPETİTOR
      </Link>
      <Link to="/giris" className="btn-primary !px-4 sm:!px-5 !py-2 sm:!py-2.5 text-xs sm:text-sm whitespace-nowrap">
        Daxil ol
      </Link>
    </nav>
  );
}
