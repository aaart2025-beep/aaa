import { cn } from "@/lib/utils";

/* Minimal line-drawn social marks (lucide dropped brand icons), kept in the
 * workbook's hand-inked stroke style. */

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[18px] w-[18px]", className)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" {...strokeProps} />
      <circle cx="12" cy="12" r="3.8" {...strokeProps} />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[18px] w-[18px]", className)}>
      <circle cx="12" cy="12" r="8.5" {...strokeProps} />
      <path d="M13.8 8.2 H12.6 a1.6 1.6 0 0 0 -1.6 1.6 V20" {...strokeProps} />
      <path d="M9.4 12.4 H13.4" {...strokeProps} />
    </svg>
  );
}

export function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[18px] w-[18px]", className)}>
      <rect x="3" y="6" width="18" height="12.5" rx="3.4" {...strokeProps} />
      <path d="M10.2 9.6 L14.8 12.25 L10.2 14.9 Z" {...strokeProps} />
    </svg>
  );
}

export function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[18px] w-[18px]", className)}>
      <path d="M4 20 L5.3 16.1 A8 8 0 1 1 7.9 18.7 Z" {...strokeProps} />
      <path d="M9 8.3 c-0.3 0 -0.6 0.1 -0.8 0.4 c-0.3 0.3 -0.9 0.9 -0.9 2 c0 1.2 0.9 2.4 1 2.5 c0.1 0.2 1.7 2.8 4.3 3.8 c2.1 0.8 2.6 0.7 3 0.6 c0.6 -0.1 1.4 -0.6 1.6 -1.2 c0.2 -0.6 0.2 -1.1 0.1 -1.2 c-0.1 -0.1 -0.3 -0.2 -0.6 -0.3 l-1.4 -0.7 c-0.2 -0.1 -0.4 -0.1 -0.6 0.1 l-0.6 0.8 c-0.1 0.2 -0.3 0.2 -0.5 0.1 c-0.7 -0.3 -1.4 -0.7 -2.3 -1.8 c-0.2 -0.3 0 -0.4 0.1 -0.6 c0.2 -0.2 0.4 -0.5 0.5 -0.7 c0.1 -0.2 0 -0.4 0 -0.5 l-0.6 -1.5 c-0.2 -0.4 -0.4 -0.4 -0.6 -0.4 z" stroke="none" fill="currentColor" />
    </svg>
  );
}
