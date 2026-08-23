import { useEffect, useState } from "react";

import { api, type ActionItem } from "../../api/client";

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-gray-100 text-gray-600",
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

  if (loading) return <p className="text-gray-400 text-sm">Loading action items…</p>;
  if (items.length === 0) return <p className="text-gray-400 text-sm">No action items detected.</p>;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-gray-900 font-medium text-sm">{item.task}</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.Medium}`}>
              {item.priority}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Owner: <span className="text-gray-700 font-medium">{item.owner}</span></span>
            {item.deadline_raw && <span>Deadline: <span className="text-gray-700 font-medium">{item.deadline_raw}</span></span>}
            <select
              value={item.status}
              onChange={(e) => updateStatus(item.id, e.target.value)}
              className="ml-auto border border-gray-200 rounded-md text-xs px-2 py-1 text-gray-700"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {item.source_quote && <p className="text-xs text-gray-400 italic">"{item.source_quote}"</p>}
        </div>
      ))}
    </div>
  );
}
