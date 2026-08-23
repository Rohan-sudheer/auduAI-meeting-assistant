import { useEffect, useState } from "react";

import { api, type Summary } from "../../api/client";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function SummaryTab({ meetingId }: { meetingId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCritique, setShowCritique] = useState(false);

  useEffect(() => {
    api
      .getSummary(meetingId)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) return <p className="text-gray-400 text-sm">Loading summary…</p>;
  if (!summary) return <p className="text-gray-400 text-sm">No summary available.</p>;

  return (
    <div className="space-y-4">
      {summary.verified && (
        <button
          onClick={() => setShowCritique((v) => !v)}
          className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100"
        >
          ✓ AI-verified by critique pipeline {showCritique ? "▲" : "▼"}
        </button>
      )}
      {showCritique && summary.critique_notes.length > 0 && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 space-y-2">
          {summary.critique_notes.map((issue, i) => (
            <div key={i}>
              <span className="font-medium">{issue.type ?? "note"}:</span> {issue.description}
              {issue.suggested_fix && <div className="text-emerald-600 text-xs mt-0.5">Fix: {issue.suggested_fix}</div>}
            </div>
          ))}
        </div>
      )}

      <Card title="Executive Summary">
        <p className="text-gray-800 text-sm leading-relaxed">{summary.executive_summary}</p>
      </Card>

      <Card title="Meeting Purpose">
        <p className="text-gray-800 text-sm leading-relaxed">{summary.meeting_purpose}</p>
      </Card>

      <Card title="Key Discussion Points">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
          {summary.key_discussion_points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </Card>

      <Card title="Decisions">
        <div className="space-y-3">
          {summary.decisions.map((d, i) => (
            <div key={i} className="text-sm">
              <p className="text-gray-900 font-medium">{d.decision}</p>
              {d.reason && <p className="text-gray-500">Reason: {d.reason}</p>}
            </div>
          ))}
          {summary.decisions.length === 0 && <p className="text-gray-400 text-sm">No explicit decisions recorded.</p>}
        </div>
      </Card>

      <Card title="Outcomes">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
          {summary.outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
