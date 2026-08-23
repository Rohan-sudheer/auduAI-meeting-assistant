import { AudioLines } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
            <AudioLines size={18} strokeWidth={2.25} />
          </span>
          <span className="font-semibold text-slate-900 tracking-tight">Meeting Summariser</span>
        </Link>
      </div>
    </header>
  );
}
