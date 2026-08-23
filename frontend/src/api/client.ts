// Strip any trailing slash so `${BASE_URL}${path}` never produces a double slash,
// regardless of whether VITE_API_URL was set with or without one.
const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export interface Meeting {
  id: string;
  title: string;
  source: string;
  status: string;
  error_message: string | null;
  duration_sec: number | null;
  created_at: string;
}

export interface Segment {
  id: string;
  order_index: number;
  start_time: number;
  end_time: number;
  text: string;
  confidence: number;
  is_uncertain: boolean;
  speaker_id: string | null;
  speaker_label: string | null;
}

export interface Speaker {
  id: string;
  display_label: string;
  display_name: string | null;
  total_speaking_time_sec: number;
}

export interface Decision {
  decision: string;
  reason?: string | null;
}

export interface CritiqueIssue {
  type?: string | null;
  description?: string | null;
  suggested_fix?: string | null;
}

export interface Summary {
  executive_summary: string;
  meeting_purpose: string;
  key_discussion_points: string[];
  decisions: Decision[];
  outcomes: string[];
  critique_notes: CritiqueIssue[];
  verified: boolean;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  deadline_raw: string | null;
  deadline_normalized: string | null;
  priority: string;
  status: string;
  source_quote: string | null;
}

export interface Topic {
  topic_index: string;
  title: string;
  start_time: number;
  end_time: number;
  summary: string;
}

export interface Citation {
  speaker: string;
  timestamp: string;
  start_time: number;
  quote: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  created_at?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

const jsonHeaders = { "Content-Type": "application/json" };

export const api = {
  uploadMeeting: (file: File, title?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    return request<{ meeting_id: string; status: string }>("/api/meetings/upload", {
      method: "POST",
      body: form,
    });
  },
  recordMeeting: (file: Blob, title?: string) => {
    const form = new FormData();
    form.append("file", file, "recording.webm");
    if (title) form.append("title", title);
    return request<{ meeting_id: string; status: string }>("/api/meetings/record", {
      method: "POST",
      body: form,
    });
  },
  listMeetings: () => request<Meeting[]>("/api/meetings"),
  getMeeting: (id: string) => request<Meeting>(`/api/meetings/${id}`),
  getTranscript: (id: string) => request<Segment[]>(`/api/meetings/${id}/transcript`),
  getSpeakers: (id: string) => request<Speaker[]>(`/api/meetings/${id}/speakers`),
  renameSpeaker: (meetingId: string, speakerId: string, displayName: string) =>
    request<Speaker>(`/api/meetings/${meetingId}/speakers/${speakerId}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ display_name: displayName }),
    }),
  getSummary: (id: string) => request<Summary>(`/api/meetings/${id}/summary`),
  getActionItems: (id: string) => request<ActionItem[]>(`/api/meetings/${id}/action-items`),
  updateActionItemStatus: (meetingId: string, itemId: string, status: string) =>
    request<ActionItem>(`/api/meetings/${meetingId}/action-items/${itemId}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ status }),
    }),
  getTopics: (id: string) => request<Topic[]>(`/api/meetings/${id}/topics`),
  askQuestion: (id: string, question: string) =>
    request<ChatMessage>(`/api/meetings/${id}/ask`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ question }),
    }),
  getChatHistory: (id: string) => request<ChatMessage[]>(`/api/meetings/${id}/chat`),
};
