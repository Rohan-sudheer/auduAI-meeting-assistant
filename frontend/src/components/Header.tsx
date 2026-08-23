import { AudioLines } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/40 backdrop-blur-2xl backdrop-saturate-150">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glass-sm transition-transform duration-300 group-hover:scale-105">
            <AudioLines size={17} strokeWidth={2.25} />
          </span>
          <span className="font-semibold text-slate-900 tracking-tight text-[15px]">AuduAI</span>
        </Link>
      </div>
    </header>
  );
}
