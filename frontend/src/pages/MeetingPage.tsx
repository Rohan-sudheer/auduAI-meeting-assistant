import {
  ArrowLeft,
  BarChart3,
  CheckSquare,
  FileText,
  ListTree,
  MessageCircleQuestion,
  Mic2,
  ScrollText,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, type Meeting } from "../api/client";
import { ProcessingView } from "../components/ProcessingView";
import { ActionItemsTab } from "../components/tabs/ActionItemsTab";
import { AskTab } from "../components/tabs/AskTab";
import { SpeakingStatsTab } from "../components/tabs/SpeakingStatsTab";
import { SummaryTab } from "../components/tabs/SummaryTab";
import { TopicsTab } from "../components/tabs/TopicsTab";
import { TranscriptTab } from "../components/tabs/TranscriptTab";
import { usePolling } from "../hooks/usePolling";

const TABS = [
  { key: "Transcript", icon: ScrollText },
  { key: "Summary", icon: FileText },
  { key: "Action Items", icon: CheckSquare },
  { key: "Topics", icon: ListTree },
  { key: "Speaking Stats", icon: BarChart3 },
  { key: "Ask", icon: MessageCircleQuestion },
] as const;
type Tab = (typeof TABS)[number]["key"];

const TERMINAL_STATUSES = new Set(["ready", "failed"]);

function formatDuration(seconds: number | null): string | null {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

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
    return <div className="max-w-xl mx-auto py-24 text-center text-slate-400">Loading…</div>;
  }
  if (meeting.status !== "ready") {
    return <ProcessingView status={meeting.status} errorMessage={meeting.error_message} />;
  }

  const duration = formatDuration(meeting.duration_sec);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        All meetings
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-xl text-brand-600 shadow-glass-sm">
          <Mic2 size={16} />
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{meeting.title}</h1>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 ml-12">
        <span className="capitalize">{meeting.source}</span>
        {duration && (
          <>
            <span>·</span>
            <span>{duration}</span>
          </>
        )}
        <span>·</span>
        <span>{new Date(meeting.created_at).toLocaleString()}</span>
      </div>

      <div className="mb-6 p-1.5 rounded-2xl bg-white/45 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-glass-sm overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-300 ${
                tab === key
                  ? "bg-white/90 text-brand-700 shadow-glass-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <Icon size={15} strokeWidth={2.25} />
              {key}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} className="animate-fade-in">
        {tab === "Transcript" && <TranscriptTab meetingId={meeting.id} />}
        {tab === "Summary" && <SummaryTab meetingId={meeting.id} />}
        {tab === "Action Items" && <ActionItemsTab meetingId={meeting.id} />}
        {tab === "Topics" && <TopicsTab meetingId={meeting.id} />}
        {tab === "Speaking Stats" && <SpeakingStatsTab meetingId={meeting.id} />}
        {tab === "Ask" && <AskTab meetingId={meeting.id} />}
      </div>
    </div>
  );
}
