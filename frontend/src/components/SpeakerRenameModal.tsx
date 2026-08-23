import { UserRound } from "lucide-react";
import { useState } from "react";

interface Props {
  currentLabel: string;
  currentName: string | null;
  onSave: (name: string) => void;
  onClose: () => void;
}

export function SpeakerRenameModal({ currentLabel, currentName, onSave, onClose }: Props) {
  const [name, setName] = useState(currentName ?? "");

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <UserRound size={15} />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Rename {currentLabel}</h3>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya"
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSave(name.trim());
            if (e.key === "Escape") onClose();
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm px-3 py-1.5 text-slate-500 hover:text-slate-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            className="text-sm px-3.5 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
