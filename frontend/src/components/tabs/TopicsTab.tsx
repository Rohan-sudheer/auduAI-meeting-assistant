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
      .then(setTopics)
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) return <p className="text-gray-400 text-sm">Loading topics…</p>;
  if (topics.length === 0) return <p className="text-gray-400 text-sm">No topics detected.</p>;

  return (
    <div className="space-y-2">
      {topics.map((t) => {
        const open = openIndex === t.topic_index;
        return (
          <div key={t.topic_index} className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setOpenIndex(open ? null : t.topic_index)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">
                {t.topic_index}. {t.title}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {formatTimestamp(t.start_time)}–{formatTimestamp(t.end_time)}
              </span>
            </button>
            {open && <p className="px-4 pb-3 text-sm text-gray-600">{t.summary}</p>}
          </div>
        );
      })}
    </div>
  );
}
