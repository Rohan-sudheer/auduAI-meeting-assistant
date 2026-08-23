import { Pencil, Users2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api, type Speaker } from "../../api/client";
import { SpeakerRenameModal } from "../SpeakerRenameModal";

const BAR_COLORS = ["bg-brand-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-sky-500"];

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function SpeakingStatsTab({ meetingId }: { meetingId: string }) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState<Speaker | null>(null);

  useEffect(() => {
    api
      .getSpeakers(meetingId)
      .then(setSpeakers)
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) return <p className="text-slate-400 text-sm">Loading speaking stats…</p>;
  if (speakers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Users2 size={28} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No speaker data available.</p>
      </div>
    );
  }

  const total = speakers.reduce((sum, s) => sum + s.total_speaking_time_sec, 0) || 1;

  const saveRename = async (speaker: Speaker, name: string) => {
    const updated = await api.renameSpeaker(meetingId, speaker.id, name);
    setSpeakers((prev) => prev.map((s) => (s.id === speaker.id ? updated : s)));
    setRenaming(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      {speakers.map((s, i) => {
        const pct = (s.total_speaking_time_sec / total) * 100;
        return (
          <div key={s.id}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <button
                onClick={() => setRenaming(s)}
                className="flex items-center gap-1.5 font-medium text-slate-800 hover:text-brand-600 transition-colors group"
              >
                {s.display_name ?? s.display_label}
                <Pencil size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <span className="text-slate-500 text-xs">
                {formatDuration(s.total_speaking_time_sec)} · {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      {renaming && (
        <SpeakerRenameModal
          currentLabel={renaming.display_label}
          currentName={renaming.display_name}
          onClose={() => setRenaming(null)}
          onSave={(name) => saveRename(renaming, name)}
        />
      )}
    </div>
  );
}
