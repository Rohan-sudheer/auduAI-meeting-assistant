import { ChevronDown, ListTree } from "lucide-react";
import { useEffect, useState } from "react";

import { api, type Topic } from "../../api/client";

function formatTimestamp(seconds: number): string {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function TopicsTab({ meetingId }: { meetingId: string }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTopics(meetingId)
      .then((t) => {
        setTopics(t);
        if (t.length > 0) setOpenIndex(t[0].topic_index);
      })
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) return <p className="text-slate-400 text-sm">Loading topics…</p>;
  if (topics.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ListTree size={28} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No topics detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {topics.map((t) => {
        const open = openIndex === t.topic_index;
        return (
          <div
            key={t.topic_index}
            className={`rounded-2xl border backdrop-blur-2xl backdrop-saturate-150 overflow-hidden transition-all duration-300 ${
              open ? "border-brand-200/70 bg-white/60 shadow-glass" : "border-white/60 bg-white/40 shadow-glass-sm"
            }`}
          >
            <button
              onClick={() => setOpenIndex(open ? null : t.topic_index)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/30 transition-colors"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-brand-700 text-xs font-semibold shadow-glass-sm">
                {t.topic_index}
              </span>
              <span className="text-sm font-medium text-slate-900 flex-1">{t.title}</span>
              <span className="text-xs text-slate-400 font-mono">
                {formatTimestamp(t.start_time)}–{formatTimestamp(t.end_time)}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <p className="px-4 pb-4 pl-14 text-sm text-slate-600 leading-relaxed animate-fade-in">{t.summary}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
