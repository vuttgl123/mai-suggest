import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="journey-layout">
      <main className="grid min-h-[50vh] place-items-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin text-brand/60" size={32} strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted">Đang tải thư hẹn...</p>
        </div>
      </main>
    </div>
  );
}
