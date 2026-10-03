import { cn } from "cn";

/** Readable assistant/output blocks on dark cards (FAQ reply, memory transcript, code samples). */
export function walkthroughPanelClassName(extra?: string): string {
  return cn(
    "rounded-lg border border-border bg-muted/60 p-4 text-sm text-foreground whitespace-pre-wrap",
    "dark:border-white/45 dark:bg-white/14 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
    extra,
  );
}

export function walkthroughCodePanelClassName(extra?: string): string {
  return cn(
    "overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 font-mono text-xs text-foreground",
    "dark:border-white/45 dark:bg-white/14 dark:text-white",
    extra,
  );
}
