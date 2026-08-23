import { Mic, Square } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  onRecorded: (blob: Blob) => void;
  disabled?: boolean;
}

export function RecordButton({ onRecorded, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onRecorded(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setSeconds(0);
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const format = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-3xl border p-10 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 ${
        recording
          ? "border-red-200/70 bg-red-50/50 shadow-glass"
          : "border-white/60 bg-white/45 shadow-glass-sm hover:bg-white/60 hover:shadow-glass"
      }`}
    >
      <button
        onClick={recording ? stop : start}
        disabled={disabled}
        className={`h-14 w-14 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
          recording ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-brand-600 hover:bg-brand-700 shadow-glass-sm"
        } disabled:opacity-50`}
      >
        {recording ? (
          <Square size={18} fill="currentColor" strokeWidth={0} />
        ) : (
          <Mic size={20} strokeWidth={2} />
        )}
      </button>
      <span className="text-sm text-slate-500">
        {recording ? (
          <span className="flex items-center gap-1.5 text-red-600 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Recording… {format(seconds)}
          </span>
        ) : (
          "Record directly from your browser"
        )}
      </span>
    </div>
  );
}
