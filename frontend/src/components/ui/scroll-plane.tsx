import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollPlaneProps {
  /** Ref of the section the scroll progress is tracked against. */
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * ScrollPlane — a large editorial plane SVG that takes off from the
 * bottom of the viewport and climbs towards the sky as the user scrolls
 * through the hero section. The motion mimics an actual take-off:
 * enters low from bottom-left, lifts off while tilting up, and exits
 * towards the top-right, shrinking into the distance.
 */
export function ScrollPlane({ targetRef, className }: ScrollPlaneProps) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    // Start animating as soon as the section enters the viewport,
    // finish by the time the bottom of the section leaves the top.
    offset: ["start end", "end start"],
  });

  // Smooth the progress so the plane flies with weight, not jitter.
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.8,
  });

  // ------------------------------------------------------------------
  // Trajectory — expressed in viewport-relative units (vw / vh).
  // The plane takes off:
  //   0.00  hidden below the viewport, bottom-left
  //   0.15  enters low on the runway, slightly tilted up
  //   0.40  lifting off through the mid-screen
  //   0.70  high in the sky, nose up, heading top-right
  //   1.00  tiny dot near the upper-right horizon, fading away
  // ------------------------------------------------------------------

  // X — start bottom-left, drift right as the plane climbs + departs.
  const x = useTransform(
    progress,
    [0, 0.15, 0.4, 0.7, 1],
    ["-20vw", "-5vw", "15vw", "45vw", "75vw"]
  );

  // Y — start below viewport, lift off, exit above the top.
  const y = useTransform(
    progress,
    [0, 0.15, 0.4, 0.7, 1],
    ["110vh", "75vh", "40vh", "10vh", "-30vh"]
  );

  // Rotation — starts level on the runway, pitches progressively upward.
  // Negative = nose up (SVG is drawn nose-right by default).
  const rotate = useTransform(
    progress,
    [0, 0.15, 0.4, 0.7, 1],
    [-5, -15, -25, -35, -45]
  );

  // Scale — largest close to the reader during takeoff, shrinks as it
  // climbs away into the distance.
  const scale = useTransform(
    progress,
    [0, 0.15, 0.4, 0.7, 1],
    [1.15, 1.2, 1.05, 0.85, 0.55]
  );

  // Opacity — fade in as it enters, fade out as it climbs away.
  const opacity = useTransform(
    progress,
    [0, 0.08, 0.85, 1],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      aria-hidden="true"
      style={{ x, y, rotate, scale, opacity }}
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[5] origin-center",
        className
      )}
    >
      {/* Editorial plane — stylised, ink-coloured with coral take-off trail */}
      <svg
        width="360"
        height="180"
        viewBox="0 0 360 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[4px_8px_0_rgba(0,0,0,0.08)]"
      >
        {/* Take-off trail — dashed arc curling down and back behind the plane */}
        <path
          d="M 60 100 Q 140 130 220 140 T 340 150"
          stroke="var(--coral)"
          strokeWidth="2"
          strokeDasharray="6 8"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
        <path
          d="M 60 112 Q 140 140 220 150 T 340 160"
          stroke="var(--ink)"
          strokeWidth="1"
          strokeDasharray="3 10"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />

        {/* Main fuselage */}
        <g transform="translate(60, 60)">
          {/* Belly */}
          <path
            d="M 10 32 Q 60 20 140 22 L 180 26 Q 195 30 198 36 Q 195 42 180 46 L 140 50 Q 60 52 10 40 Q 2 36 10 32 Z"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Tail fin */}
          <path
            d="M 14 32 L 4 6 L 18 10 L 36 32 Z"
            fill="var(--coral)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Tail horizontal stabiliser */}
          <path
            d="M 20 40 L 8 52 L 22 48 L 38 42 Z"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Main wing */}
          <path
            d="M 90 30 L 70 0 L 112 16 L 130 34 L 112 38 Q 100 36 90 30 Z"
            fill="var(--ink)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Under wing */}
          <path
            d="M 92 42 L 80 64 L 116 50 L 124 44 Z"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Nose */}
          <circle cx="194" cy="36" r="3" fill="var(--coral)" stroke="var(--ink)" strokeWidth="1" />

          {/* Windows — small dashes along the fuselage */}
          <g fill="var(--ink)">
            <circle cx="60" cy="32" r="1.5" />
            <circle cx="72" cy="31" r="1.5" />
            <circle cx="84" cy="30" r="1.5" />
            <circle cx="140" cy="30" r="1.5" />
            <circle cx="152" cy="31" r="1.5" />
            <circle cx="164" cy="32" r="1.5" />
            <circle cx="176" cy="33" r="1.5" />
          </g>

          {/* Engine on wing */}
          <ellipse
            cx="104"
            cy="44"
            rx="8"
            ry="4"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2"
          />
        </g>

        {/* Small SBK ident stamp on the tail */}
        <text
          x="28"
          y="80"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="7"
          fill="var(--ink)"
          letterSpacing="1"
        >
          FAT · 2026
        </text>
      </svg>
    </motion.div>
  );
}
