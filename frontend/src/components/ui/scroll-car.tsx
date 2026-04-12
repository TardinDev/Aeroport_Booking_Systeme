import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollCarProps {
  /** Ref of the section the scroll progress is tracked against. */
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * ScrollCar — a checker-roof taxi cab that drives across the bottom
 * of the viewport as the user scrolls through the hero. It enters
 * from the bottom-right (the kerb), parks briefly mid-screen — long
 * enough to read the TAXI sign — then continues out to the left.
 *
 * The motion is intentionally counter-directional to ScrollPlane:
 * the plane lifts off to the upper right while the taxi cruises
 * along the lower edge, the two together telling the "Fly and Taxi"
 * story without any text.
 */
export function ScrollCar({ targetRef, className }: ScrollCarProps) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.9,
  });

  // X — start off-screen right (the airport exit), drive across to
  // the left (the city), exit fully off-screen left.
  const x = useTransform(
    progress,
    [0, 0.15, 0.4, 0.7, 1],
    ["120vw", "75vw", "40vw", "10vw", "-30vw"]
  );

  // Y — anchored to the road along the bottom of the viewport with
  // a tiny bounce as the suspension settles.
  const y = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    ["88vh", "82vh", "84vh", "82vh", "84vh"]
  );

  // Slight rocking as the cab eases into traffic.
  const rotate = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    [2, -1, 0, -1, 1]
  );

  // Scale — taxi is closer when entering, slightly smaller as it
  // drives into the distance.
  const scale = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    [1.05, 1.1, 1, 0.92, 0.8]
  );

  // Opacity — fade in / out at the edges.
  const opacity = useTransform(progress, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);

  // Wheels keep spinning as the cab moves.
  const wheelRotate = useTransform(progress, [0, 1], [0, 1440]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ x, y, rotate, scale, opacity }}
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[5] origin-center",
        className
      )}
    >
      {/* Editorial taxi — yellow cab with checker stripe and TAXI sign */}
      <svg
        width="280"
        height="150"
        viewBox="0 0 280 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[4px_8px_0_rgba(0,0,0,0.10)]"
      >
        {/* Dashed road line beneath the cab */}
        <path
          d="M 0 132 L 280 132"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeDasharray="10 8"
          opacity="0.3"
        />

        {/* TAXI roof sign — coral panel sitting on top */}
        <g transform="translate(96, 22)">
          <rect
            x="0"
            y="0"
            width="80"
            height="22"
            fill="var(--coral)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            rx="2"
          />
          {/* Two little pegs holding the sign on the roof */}
          <rect x="8" y="22" width="3" height="6" fill="var(--ink)" />
          <rect x="69" y="22" width="3" height="6" fill="var(--ink)" />
          <text
            x="40"
            y="16"
            fontFamily="'Fraunces', 'Instrument Serif', serif"
            fontSize="14"
            fontStyle="italic"
            fontWeight="700"
            fill="var(--paper)"
            textAnchor="middle"
            letterSpacing="2"
          >
            TAXI
          </text>
        </g>

        {/* Main cab body — yellow with ink outline */}
        <g>
          {/* Lower body */}
          <path
            d="M 30 110 L 30 75 Q 30 65 40 60 L 80 50 Q 100 46 140 46 Q 180 46 200 50 L 240 60 Q 250 65 250 75 L 250 110 Z"
            fill="#F5C518"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Roof / cabin */}
          <path
            d="M 70 50 L 90 28 Q 92 24 96 24 L 184 24 Q 188 24 190 28 L 210 50 Z"
            fill="#F5C518"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Windscreen */}
          <path
            d="M 96 28 L 110 48 L 138 48 L 138 28 Z"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.85"
          />
          {/* Rear window */}
          <path
            d="M 142 28 L 142 48 L 170 48 L 184 28 Z"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.85"
          />
          {/* Door pillar */}
          <line
            x1="140"
            y1="28"
            x2="140"
            y2="48"
            stroke="var(--ink)"
            strokeWidth="2"
          />

          {/* Iconic checker stripe along the doors */}
          <g transform="translate(40, 80)">
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x={i * 16}
                y={(i % 2) * 6}
                width="16"
                height="6"
                fill={i % 2 === 0 ? "var(--ink)" : "var(--paper)"}
                stroke="var(--ink)"
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* Door handles */}
          <line
            x1="80"
            y1="92"
            x2="92"
            y2="92"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="188"
            y1="92"
            x2="200"
            y2="92"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Headlight */}
          <circle
            cx="246"
            cy="80"
            r="4"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
          {/* Tail light */}
          <circle
            cx="34"
            cy="80"
            r="3"
            fill="var(--coral)"
            stroke="var(--ink)"
            strokeWidth="1.5"
          />

          {/* Bumpers */}
          <rect
            x="26"
            y="100"
            width="6"
            height="14"
            fill="var(--ink)"
            stroke="var(--ink)"
            strokeWidth="1"
          />
          <rect
            x="248"
            y="100"
            width="6"
            height="14"
            fill="var(--ink)"
            stroke="var(--ink)"
            strokeWidth="1"
          />
        </g>

        {/* Front wheel — spins as the cab drives */}
        <motion.g style={{ rotate: wheelRotate, originX: "210px", originY: "118px" }}>
          <circle
            cx="210"
            cy="118"
            r="14"
            fill="var(--ink)"
            stroke="var(--ink)"
            strokeWidth="2"
          />
          <circle cx="210" cy="118" r="6" fill="var(--paper)" />
          <line x1="210" y1="106" x2="210" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
          <line x1="198" y1="118" x2="222" y2="118" stroke="var(--ink)" strokeWidth="1.5" />
          <line x1="201" y1="109" x2="219" y2="127" stroke="var(--ink)" strokeWidth="1" />
          <line x1="201" y1="127" x2="219" y2="109" stroke="var(--ink)" strokeWidth="1" />
        </motion.g>

        {/* Rear wheel — spins as the cab drives */}
        <motion.g style={{ rotate: wheelRotate, originX: "70px", originY: "118px" }}>
          <circle
            cx="70"
            cy="118"
            r="14"
            fill="var(--ink)"
            stroke="var(--ink)"
            strokeWidth="2"
          />
          <circle cx="70" cy="118" r="6" fill="var(--paper)" />
          <line x1="70" y1="106" x2="70" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
          <line x1="58" y1="118" x2="82" y2="118" stroke="var(--ink)" strokeWidth="1.5" />
          <line x1="61" y1="109" x2="79" y2="127" stroke="var(--ink)" strokeWidth="1" />
          <line x1="61" y1="127" x2="79" y2="109" stroke="var(--ink)" strokeWidth="1" />
        </motion.g>

        {/* Small "FAT" plate on the front bumper */}
        <text
          x="244"
          y="124"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="6"
          fill="var(--paper)"
          textAnchor="end"
          letterSpacing="0.5"
        >
          FAT · 26
        </text>
      </svg>
    </motion.div>
  );
}
