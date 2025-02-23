import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-primary/60 font-mono">INITIALIZING FEED DATABASE...</p>
    </div>
  );
}