import * as React from "react";
import { cn } from "@/lib/utils";

interface DestinationPathProps extends React.SVGAttributes<SVGSVGElement> {
  /** Curvature (0 = straight, 1 = strong arc) */
  arc?: number;
  animated?: boolean;
}

/**
 * DestinationPath — hand-drawn-feel dashed arc + little plane marker,
 * meant to represent a flight trajectory between two endpoints. The
 * caller controls width/height via className.
 */
export const DestinationPath = React.forwardRef<
  SVGSVGElement,
  DestinationPathProps
>(({ className, arc = 0.35, animated = true, ...props }, ref) => {
  const width = 400;
  const height = 120;
  const startX = 20;
  const startY = height - 20;
  const endX = width - 20;
  const endY = height - 20;
  const midX = width / 2;
  const midY = height - 20 - arc * height * 1.4;

  const d = `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
      {...props}
    >
      {/* Dashed arc */}
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 5"
        className={cn(animated && "[&]:[animation:dash-travel_2.5s_linear_infinite]")}
        style={{ strokeDashoffset: 0 }}
      />

      {/* Origin dot */}
      <circle
        cx={startX}
        cy={startY}
        r="4"
        fill="currentColor"
      />
      {/* Origin ring */}
      <circle
        cx={startX}
        cy={startY}
        r="8"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Destination dot */}
      <circle cx={endX} cy={endY} r="4" fill="currentColor" />
      <circle
        cx={endX}
        cy={endY}
        r="8"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Plane at apex */}
      <g transform={`translate(${midX - 10}, ${midY - 10}) rotate(0)`}>
        <path
          d="M20,4 L4,12 L9,14 L4,20 L12,18 L20,4 Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
});
DestinationPath.displayName = "DestinationPath";
