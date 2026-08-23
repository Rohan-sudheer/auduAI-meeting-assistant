import { useEffect, useState } from "react";

import { api, type Speaker } from "../../api/client";
import { SpeakerRenameModal } from "../SpeakerRenameModal";

const BAR_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-sky-500"];

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

  if (loading) return <p className="text-gray-400 text-sm">Loading speaking stats…</p>;
  if (speakers.length === 0) return <p className="text-gray-400 text-sm">No speaker data available.</p>;

  const total = speakers.reduce((sum, s) => sum + s.total_speaking_time_sec, 0) || 1;

  const saveRename = async (speaker: Speaker, name: string) => {
    const updated = await api.renameSpeaker(meetingId, speaker.id, name);
    setSpeakers((prev) => prev.map((s) => (s.id === speaker.id ? updated : s)));
    setRenaming(null);
  };

  return (
    <div className="space-y-4">
      {speakers.map((s, i) => {
        const pct = (s.total_speaking_time_sec / total) * 100;
        return (
          <div key={s.id}>
            <div className="flex items-center justify-between text-sm mb-1">
              <button
                onClick={() => setRenaming(s)}
                className="font-medium text-gray-800 hover:text-indigo-600"
              >
                {s.display_name ?? s.display_label} <span className="text-gray-400 text-xs">(rename)</span>
              </button>
              <span className="text-gray-500">
                {formatDuration(s.total_speaking_time_sec)} · {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]} rounded-full transition-all`}
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
