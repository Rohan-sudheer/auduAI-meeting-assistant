import {
  CheckCircle2,
  ChevronDown,
  Compass,
  Flag,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";

import { api, type Summary } from "../../api/client";

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        <Icon size={14} strokeWidth={2.25} />
        {title}
      </h3>
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

  if (loading) return <p className="text-slate-400 text-sm">Loading summary…</p>;
  if (!summary) return <p className="text-slate-400 text-sm">No summary available.</p>;

  return (
    <div className="space-y-4">
      {summary.verified && (
        <button
          onClick={() => setShowCritique((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition-colors"
        >
          <ShieldCheck size={13} />
          AI-verified by critique pipeline
          <ChevronDown size={13} className={`transition-transform ${showCritique ? "rotate-180" : ""}`} />
        </button>
      )}
      {showCritique && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 space-y-2 animate-fade-in">
          {summary.critique_notes.length > 0 ? (
            summary.critique_notes.map((issue, i) => (
              <div key={i}>
                <span className="font-medium">{issue.type ?? "note"}:</span> {issue.description}
                {issue.suggested_fix && (
                  <div className="text-emerald-600 text-xs mt-0.5">Fix: {issue.suggested_fix}</div>
                )}
              </div>
            ))
          ) : (
            <p className="flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              The Critic agent found no issues with the first draft — nothing to revise.
            </p>
          )}
        </div>
      )}

      <Card title="Executive Summary" icon={MessageSquare}>
        <p className="text-slate-800 text-sm leading-relaxed">{summary.executive_summary}</p>
      </Card>

      <Card title="Meeting Purpose" icon={Target}>
        <p className="text-slate-800 text-sm leading-relaxed">{summary.meeting_purpose}</p>
      </Card>

      <Card title="Key Discussion Points" icon={Compass}>
        <ul className="space-y-1.5 text-sm text-slate-800">
          {summary.key_discussion_points.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand-400 mt-1.5 h-1 w-1 rounded-full bg-brand-400 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Decisions" icon={Flag}>
        <div className="space-y-3">
          {summary.decisions.map((d, i) => (
            <div key={i} className="text-sm border-l-2 border-brand-200 pl-3">
              <p className="text-slate-900 font-medium">{d.decision}</p>
              {d.reason && <p className="text-slate-500 mt-0.5">Reason: {d.reason}</p>}
            </div>
          ))}
          {summary.decisions.length === 0 && (
            <p className="text-slate-400 text-sm">No explicit decisions recorded.</p>
          )}
        </div>
      </Card>

      <Card title="Outcomes" icon={ListChecks}>
        <ul className="space-y-1.5 text-sm text-slate-800">
          {summary.outcomes.map((o, i) => (
            <li key={i} className="flex gap-2">
              <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
              {o}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
