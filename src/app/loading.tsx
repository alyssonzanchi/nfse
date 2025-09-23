import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Loader2 className="size-10 animate-spin text-zinc-50" />
    </div>
  );
}
