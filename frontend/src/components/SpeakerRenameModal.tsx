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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-6 w-80 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Rename {currentLabel}</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSave(name.trim());
            if (e.key === "Escape") onClose();
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
