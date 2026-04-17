import { cn } from "@/lib/utils";

interface InkWashProps {
  className?: string;
}

/**
 * Hand-drawn compass-rose / meridian ink flourish. Purely decorative backdrop
 * for editorial sections. Rendered as an inline SVG with very low opacity so
 * it reads as a paper watermark.
 */
export function InkWash({ className }: InkWashProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <radialGradient id="wash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="300" cy="300" r="260" fill="url(#wash)" />

      {/* Meridians */}
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.25" fill="none">
        <ellipse cx="300" cy="300" rx="260" ry="80" />
        <ellipse cx="300" cy="300" rx="260" ry="150" />
        <ellipse cx="300" cy="300" rx="260" ry="220" />
        <ellipse cx="300" cy="300" rx="80" ry="260" />
        <ellipse cx="300" cy="300" rx="150" ry="260" />
        <ellipse cx="300" cy="300" rx="220" ry="260" />
      </g>

      {/* Compass points */}
      <g
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.35"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M300 40 L300 560" />
        <path d="M40 300 L560 300" />
        <path d="M112 112 L488 488" />
        <path d="M488 112 L112 488" />
      </g>

      {/* Rings */}
      <g stroke="currentColor" fill="none" opacity="0.35">
        <circle cx="300" cy="300" r="260" strokeWidth="0.8" />
        <circle cx="300" cy="300" r="200" strokeWidth="0.4" />
        <circle cx="300" cy="300" r="140" strokeWidth="0.4" />
      </g>

      {/* Cardinal letters */}
      <g
        fill="currentColor"
        opacity="0.55"
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: "italic",
          fontSize: "22px",
        }}
      >
        <text x="300" y="30" textAnchor="middle">
          N
        </text>
        <text x="300" y="582" textAnchor="middle">
          S
        </text>
        <text x="28" y="308" textAnchor="middle">
          O
        </text>
        <text x="576" y="308" textAnchor="middle">
          E
        </text>
      </g>
    </svg>
  );
}
