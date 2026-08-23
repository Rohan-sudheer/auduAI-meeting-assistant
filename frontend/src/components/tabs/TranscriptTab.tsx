import { useEffect, useState } from "react";

import { api, type Segment, type Speaker } from "../../api/client";
import { SpeakerRenameModal } from "../SpeakerRenameModal";

const PAUSE_THRESHOLD_SEC = 1.5;

const SPEAKER_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
];

function formatTimestamp(seconds: number): string {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function colorFor(label: string | null): string {
  if (!label) return "bg-gray-100 text-gray-600";
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

  if (loading) return <p className="text-gray-400 text-sm">Loading transcript…</p>;
  if (segments.length === 0) return <p className="text-gray-400 text-sm">No transcript available.</p>;

  const renamingSpeaker = speakers.find((s) => s.id === renamingSpeakerId) ?? null;

  return (
    <div className="space-y-1">
      {segments.map((s, i) => {
        const prev = segments[i - 1];
        const gap = prev ? s.start_time - prev.end_time : 0;
        return (
          <div key={s.id}>
            {prev && gap > PAUSE_THRESHOLD_SEC && (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <div className="flex-1 h-px bg-gray-200" />
                pause · {gap.toFixed(1)}s
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <div
              className={`flex gap-3 px-3 py-2 rounded-lg ${
                s.is_uncertain ? "bg-amber-50 border border-amber-200" : ""
              }`}
            >
              <span className="text-xs text-gray-400 font-mono pt-0.5 w-12 shrink-0">
                {formatTimestamp(s.start_time)}
              </span>
              <button
                onClick={() => s.speaker_id && setRenamingSpeakerId(s.speaker_id)}
                className={`text-xs font-medium px-2 py-0.5 rounded-full h-fit shrink-0 hover:ring-2 hover:ring-offset-1 ${colorFor(
                  s.speaker_label
                )}`}
              >
                {s.speaker_label ?? "Unknown"}
              </button>
              <span className="text-gray-800 text-sm leading-relaxed">{s.text}</span>
              {s.is_uncertain && (
                <span className="text-xs text-amber-600 shrink-0 ml-auto" title="Low transcription confidence">
                  ⚠
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
    </div>
  );
}
