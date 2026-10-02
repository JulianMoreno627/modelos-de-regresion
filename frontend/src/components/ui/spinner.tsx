import { cn } from "@/lib/cn";

type SpinnerTone = "default" | "light";

const TONES: Record<SpinnerTone, string> = {
  default: "border-current border-r-transparent",
  light: "border-white/95 border-r-transparent",
};

export function Spinner({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: SpinnerTone;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 rounded-full border-2 motion-safe:animate-spin",
        TONES[tone],
        className,
      )}
    />
  );
}
