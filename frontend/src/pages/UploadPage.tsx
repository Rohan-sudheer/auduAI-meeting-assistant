import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api, type Meeting } from "../api/client";
import { RecordButton } from "../components/RecordButton";
import { UploadDropzone } from "../components/UploadDropzone";

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
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Meeting Summariser</h1>
      <p className="text-gray-500 mb-10">
        Upload an MP3 or record straight from your browser to get a transcript, summary, action
        items, and an AI you can ask questions about the meeting.
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <UploadDropzone onFile={handleUpload} disabled={busy} />
        <RecordButton onRecorded={handleRecorded} disabled={busy} />
      </div>

      {meetings.length > 0 && (
        <div className="mt-14">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Past meetings
          </h2>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {meetings.map((m) => (
              <li
                key={m.id}
                onClick={() => navigate(`/meetings/${m.id}`)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
              >
                <span className="text-gray-800">{m.title}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    m.status === "ready"
                      ? "bg-green-100 text-green-700"
                      : m.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
