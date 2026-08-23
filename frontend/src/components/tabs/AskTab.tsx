import { Bot, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { api, type ChatMessage } from "../../api/client";

function formatTimestamp(seconds: number | null | undefined): string {
  if (seconds == null) return "";
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const SUGGESTIONS = [
  "What decisions were made?",
  "Who was assigned any tasks?",
  "What deadlines were mentioned?",
];

export function AskTab({ meetingId }: { meetingId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getChatHistory(meetingId).then(setMessages);
  }, [meetingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (q: string) => {
    if (!q.trim() || sending) return;
    setSending(true);
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: q, citations: [] }]);
    try {
      const reply = await api.askQuestion(meetingId, q);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${(err as Error).message}`, citations: [] },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3">
              <Sparkles size={20} />
            </span>
            <p className="text-sm text-slate-500 mb-4">Ask anything about this meeting — I'll answer from the transcript.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-3 py-1.5 hover:bg-brand-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 mt-0.5">
                <Bot size={14} />
              </span>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-brand-600 text-white rounded-br-md"
                  : "bg-slate-100 text-slate-800 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              {m.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.citations.map((c, ci) => (
                    <span
                      key={ci}
                      title={c.quote ?? ""}
                      className="text-xs bg-white/80 text-brand-700 rounded-full px-2 py-0.5 border border-brand-200 cursor-help"
                    >
                      {c.speaker ?? "Unknown"} @ {c.timestamp ?? formatTimestamp(c.start_time)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {m.role === "user" && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 mt-0.5">
                <User size={14} />
              </span>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(question);
        }}
        className="flex gap-2 p-4 border-t border-slate-200 bg-slate-50/50"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about this meeting…"
          className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
        <button
          type="submit"
          disabled={sending}
          className="flex items-center justify-center h-10 w-10 shrink-0 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
