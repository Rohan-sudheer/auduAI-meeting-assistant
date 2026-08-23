import { useState } from "react";
import { useParams } from "react-router-dom";

import { api, type Meeting } from "../api/client";
import { ProcessingView } from "../components/ProcessingView";
import { ActionItemsTab } from "../components/tabs/ActionItemsTab";
import { AskTab } from "../components/tabs/AskTab";
import { SpeakingStatsTab } from "../components/tabs/SpeakingStatsTab";
import { SummaryTab } from "../components/tabs/SummaryTab";
import { TopicsTab } from "../components/tabs/TopicsTab";
import { TranscriptTab } from "../components/tabs/TranscriptTab";
import { usePolling } from "../hooks/usePolling";

const TABS = ["Transcript", "Summary", "Action Items", "Topics", "Speaking Stats", "Ask"] as const;
type Tab = (typeof TABS)[number];

const TERMINAL_STATUSES = new Set(["ready", "failed"]);

export function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("Transcript");
  const { data: meeting, error } = usePolling<Meeting>(
    () => api.getMeeting(id!),
    2000,
    !!id,
    (m) => TERMINAL_STATUSES.has(m.status)
  );

  if (error) {
    return <div className="max-w-xl mx-auto py-24 text-center text-red-600">{error.message}</div>;
  }
  if (!meeting) {
    return <div className="max-w-xl mx-auto py-24 text-center text-gray-400">Loading…</div>;
  }
  if (meeting.status !== "ready") {
    return <ProcessingView status={meeting.status} errorMessage={meeting.error_message} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{meeting.title}</h1>
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Transcript" && <TranscriptTab meetingId={meeting.id} />}
      {tab === "Summary" && <SummaryTab meetingId={meeting.id} />}
      {tab === "Action Items" && <ActionItemsTab meetingId={meeting.id} />}
      {tab === "Topics" && <TopicsTab meetingId={meeting.id} />}
      {tab === "Speaking Stats" && <SpeakingStatsTab meetingId={meeting.id} />}
      {tab === "Ask" && <AskTab meetingId={meeting.id} />}
    </div>
  );
}
