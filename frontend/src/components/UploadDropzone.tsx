import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={`flex flex-col items-center justify-center gap-3 rounded-3xl border p-10 text-center cursor-pointer transition-all duration-300 backdrop-blur-2xl backdrop-saturate-150 ${
        dragOver
          ? "border-brand-300 bg-brand-50/60 shadow-glass scale-[1.01]"
          : "border-white/60 bg-white/45 shadow-glass-sm hover:bg-white/60 hover:shadow-glass"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-brand-600 shadow-glass-sm">
        <UploadCloud size={22} strokeWidth={2} />
      </span>
      <span className="text-base font-semibold text-slate-800">Drop an MP3 here, or click to browse</span>
      <span className="text-sm text-slate-500">Upload a meeting recording to transcribe and summarize</span>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}
