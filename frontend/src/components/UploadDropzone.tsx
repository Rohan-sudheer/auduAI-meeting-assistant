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
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-150 bg-white ${
        dragOver
          ? "border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10 scale-[1.01]"
          : "border-slate-200 hover:border-brand-300 hover:shadow-md"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <UploadCloud size={22} strokeWidth={2} />
      </span>
      <span className="text-base font-semibold text-slate-800">Drop an MP3 here, or click to browse</span>
      <span className="text-sm text-slate-400">Upload a meeting recording to transcribe and summarize</span>
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
