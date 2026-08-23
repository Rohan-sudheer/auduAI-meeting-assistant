import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, type Meeting } from "../api/client";
import { RecordButton } from "../components/RecordButton";
import { UploadDropzone } from "../components/UploadDropzone";

const STATUS_META: Record<string, { icon: React.ReactNode; classes: string }> = {
  ready: { icon: <CheckCircle2 size={13} />, classes: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  failed: { icon: <XCircle size={13} />, classes: "bg-red-50 text-red-700 ring-red-600/20" },
};

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    icon: <Loader2 size={13} className="animate-spin" />,
    classes: "bg-amber-50 text-amber-700 ring-amber-600/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${meta.classes}`}>
      {meta.icon}
      {status}
    </span>
  );
}

export function UploadPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listMeetings().then(setMeetings).catch(() => {});
  }, []);

  const handleUpload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const { meeting_id } = await api.uploadMeeting(file, file.name);
      navigate(`/meetings/${meeting_id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const handleRecorded = async (blob: Blob) => {
    setBusy(true);
    setError(null);
    try {
      const { meeting_id } = await api.recordMeeting(blob, "Browser recording");
      navigate(`/meetings/${meeting_id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
      <div className="text-center mb-12 animate-fade-in">
        <span className="inline-block text-xs font-semibold tracking-wide text-brand-700 bg-brand-50 rounded-full px-3 py-1 mb-4 ring-1 ring-inset ring-brand-600/20">
          AI meeting assistant
        </span>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
          Turn any meeting into <span className="text-brand-600">answers</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
          Upload an MP3 or record straight from your browser to get a transcript, an AI-verified
          summary, action items — and a chat you can ask anything about what was said.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UploadDropzone onFile={handleUpload} disabled={busy} />
        <RecordButton onRecorded={handleRecorded} disabled={busy} />
      </div>

      {meetings.length > 0 && (
        <div className="mt-16 animate-fade-in">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            <Clock size={14} />
            Past meetings
          </h2>
          <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {meetings.map((m) => (
              <li
                key={m.id}
                onClick={() => navigate(`/meetings/${m.id}`)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-700 font-medium text-sm truncate pr-4">{m.title}</span>
                <StatusPill status={m.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
