import { AlertTriangle, CheckCircle2, Database, Sparkles, UploadCloud, Waves } from "lucide-react";

import { GlassCard } from "./GlassCard";

interface Props {
  status: string;
  errorMessage?: string | null;
}

const STEPS = [
  { key: "uploaded", label: "Uploaded", icon: UploadCloud },
  { key: "transcribing", label: "Transcribing", icon: Waves },
  { key: "summarizing", label: "Analyzing", icon: Sparkles },
  { key: "embedding", label: "Indexing", icon: Database },
  { key: "ready", label: "Ready", icon: CheckCircle2 },
];

export function ProcessingView({ status, errorMessage }: Props) {
  if (status === "failed") {
    return (
      <div className="max-w-xl mx-auto py-24 text-center px-6 animate-fade-in">
        <GlassCard className="p-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50/80 text-red-600 mb-4">
            <AlertTriangle size={22} />
          </span>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Processing failed</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap text-left bg-white/50 border border-white/60 rounded-xl p-4 mt-4 max-h-64 overflow-auto font-mono text-xs">
            {errorMessage}
          </p>
        </GlassCard>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="max-w-lg mx-auto py-20 text-center px-6 animate-fade-in">
      <GlassCard className="px-8 pt-10 pb-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Processing your meeting</h2>
        <p className="text-sm text-slate-500 mb-12">This usually takes under a minute</p>
        <div className="flex items-start justify-between relative">
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/70" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-brand-500 transition-all duration-700"
            style={{
              width: `calc(${(Math.max(currentIndex, 0) / (STEPS.length - 1)) * 100}% - ${
                currentIndex === 0 ? "0px" : "20px"
              })`,
            }}
          />
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 w-16">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done
                      ? "bg-brand-600 border-brand-600 text-white"
                      : active
                      ? "bg-white/90 border-brand-500 text-brand-600 shadow-glass-sm scale-110"
                      : "bg-white/50 border-white/70 text-slate-300"
                  }`}
                >
                  <Icon size={16} strokeWidth={2.25} className={active ? "animate-pulse" : ""} />
                </div>
                <span className={`text-[11px] font-medium ${active ? "text-brand-700" : done ? "text-slate-600" : "text-slate-300"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
