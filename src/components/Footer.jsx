export default function Footer() {
  return (
    <footer className="bg-inkdeep text-white/60 py-10 border-t border-white/5">
      <div className="container-px max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <p>© {new Date().getFullYear()} Repetitor CRM. Bütün hüquqlar qorunur.</p>
        <div className="flex items-center gap-2">
          <span>By securtiy_group</span>
          <span className="opacity-30">·</span>
          <a
            href="https://instagram.com/securtiy_group"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-white transition-colors"
          >
            instagram.com/securtiy_group
          </a>
        </div>
      </div>
    </footer>
  );
}
