interface Props {
  status: string;
  errorMessage?: string | null;
}

const STEPS = ["uploaded", "transcribing", "summarizing", "embedding", "ready"];

export function ProcessingView({ status, errorMessage }: Props) {
  if (status === "failed") {
    return (
      <div className="max-w-xl mx-auto py-24 text-center px-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Processing failed</h2>
        <p className="text-sm text-gray-500 whitespace-pre-wrap text-left bg-gray-50 rounded-lg p-4 mt-4 max-h-64 overflow-auto">
          {errorMessage}
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="max-w-xl mx-auto py-24 text-center px-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-8">Processing your meeting…</h2>
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                i <= currentIndex ? "bg-indigo-600" : "bg-gray-200"
              } ${i === currentIndex ? "animate-pulse" : ""}`}
            />
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-gray-200" />}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500 capitalize">{status}…</p>
    </div>
  );
}
