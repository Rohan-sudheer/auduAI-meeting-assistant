import { ArrowDown, ArrowRight, ArrowUp, ClipboardList, Quote } from "lucide-react";
import { useEffect, useState } from "react";

import { api, type ActionItem } from "../../api/client";

const PRIORITY_META: Record<string, { classes: string; icon: React.ReactNode }> = {
  High: { classes: "bg-red-50 text-red-700 ring-red-600/20", icon: <ArrowUp size={12} /> },
  Medium: { classes: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: <ArrowRight size={12} /> },
  Low: { classes: "bg-slate-100 text-slate-600 ring-slate-500/20", icon: <ArrowDown size={12} /> },
};

const STATUSES = ["Open", "In Progress", "Done"];

export function ActionItemsTab({ meetingId }: { meetingId: string }) {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getActionItems(meetingId)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [meetingId]);

  const updateStatus = async (id: string, status: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    await api.updateActionItemStatus(meetingId, id, status);
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading action items…</p>;
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ClipboardList size={28} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No action items detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const priority = PRIORITY_META[item.priority] ?? PRIORITY_META.Medium;
        const done = item.status === "Done";
        return (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 flex flex-col gap-2.5 bg-white shadow-sm transition-opacity ${
              done ? "border-slate-100 opacity-60" : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className={`text-slate-900 font-medium text-sm ${done ? "line-through" : ""}`}>{item.task}</p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ring-1 ring-inset ${priority.classes}`}
              >
                {priority.icon}
                {item.priority}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span>
                Owner: <span className="text-slate-700 font-medium">{item.owner}</span>
              </span>
              {item.deadline_raw && (
                <span>
                  Deadline: <span className="text-slate-700 font-medium">{item.deadline_raw}</span>
                </span>
              )}
              <select
                value={item.status}
                onChange={(e) => updateStatus(item.id, e.target.value)}
                className="ml-auto border border-slate-200 rounded-lg text-xs px-2 py-1 text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {item.source_quote && (
              <p className="flex items-start gap-1.5 text-xs text-slate-400 italic">
                <Quote size={11} className="mt-0.5 shrink-0" />
                {item.source_quote}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
