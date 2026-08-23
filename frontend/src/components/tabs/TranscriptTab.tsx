import { AlertTriangle, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

import { api, type Segment, type Speaker } from "../../api/client";
import { GlassCard } from "../GlassCard";
import { SpeakerRenameModal } from "../SpeakerRenameModal";

const PAUSE_THRESHOLD_SEC = 1.5;

const SPEAKER_COLORS = [
  "bg-brand-100/80 text-brand-700",
  "bg-emerald-100/80 text-emerald-700",
  "bg-amber-100/80 text-amber-700",
  "bg-pink-100/80 text-pink-700",
  "bg-sky-100/80 text-sky-700",
];

function formatTimestamp(seconds: number): string {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function colorFor(label: string | null): string {
  if (!label) return "bg-slate-100/80 text-slate-600";
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash + label.charCodeAt(i)) % SPEAKER_COLORS.length;
  return SPEAKER_COLORS[hash];
}

export function TranscriptTab({ meetingId }: { meetingId: string }) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [renamingSpeakerId, setRenamingSpeakerId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getTranscript(meetingId), api.getSpeakers(meetingId)])
      .then(([segs, spks]) => {
        setSegments(segs);
        setSpeakers(spks);
      })
      .finally(() => setLoading(false));
  }, [meetingId]);

  const saveRename = async (speakerId: string, name: string) => {
    const updated = await api.renameSpeaker(meetingId, speakerId, name);
    setSpeakers((prev) => prev.map((s) => (s.id === speakerId ? updated : s)));
    setSegments((prev) =>
      prev.map((s) => (s.speaker_id === speakerId ? { ...s, speaker_label: updated.display_name } : s))
    );
    setRenamingSpeakerId(null);
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading transcript…</p>;
  if (segments.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ScrollText size={28} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No transcript available.</p>
      </div>
    );
  }

  const renamingSpeaker = speakers.find((s) => s.id === renamingSpeakerId) ?? null;

  return (
    <GlassCard className="p-3 space-y-1">
      {segments.map((s, i) => {
        const prev = segments[i - 1];
        const gap = prev ? s.start_time - prev.end_time : 0;
        return (
          <div key={s.id}>
            {prev && gap > PAUSE_THRESHOLD_SEC && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <div className="flex-1 h-px bg-white/60" />
                pause · {gap.toFixed(1)}s
                <div className="flex-1 h-px bg-white/60" />
              </div>
            )}
            <div
              className={`flex gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                s.is_uncertain ? "bg-amber-50/70" : "hover:bg-white/40"
              }`}
            >
              <span className="text-xs text-slate-400 font-mono pt-1 w-12 shrink-0">
                {formatTimestamp(s.start_time)}
              </span>
              <button
                onClick={() => s.speaker_id && setRenamingSpeakerId(s.speaker_id)}
                className={`text-xs font-medium px-2 py-1 rounded-full h-fit shrink-0 hover:ring-2 hover:ring-offset-1 transition-all ${colorFor(
                  s.speaker_label
                )}`}
              >
                {s.speaker_label ?? "Unknown"}
              </button>
              <span className="text-slate-800 text-sm leading-relaxed pt-0.5">{s.text}</span>
              {s.is_uncertain && (
                <span className="text-amber-500 shrink-0 ml-auto pt-1" title="Low transcription confidence">
                  <AlertTriangle size={13} />
                </span>
              )}
            </div>
          </div>
        );
      })}

      {renamingSpeaker && (
        <SpeakerRenameModal
          currentLabel={renamingSpeaker.display_label}
          currentName={renamingSpeaker.display_name}
          onClose={() => setRenamingSpeakerId(null)}
          onSave={(name) => saveRename(renamingSpeaker.id, name)}
        />
      )}
    </GlassCard>
  );
}
