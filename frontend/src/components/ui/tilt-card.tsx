import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps extends HTMLMotionProps<"div"> {
  /** Max rotation in degrees along each axis. */
  max?: number;
  /** Scale on hover. */
  scale?: number;
}

/**
 * 3D tilt wrapper — child tilts toward cursor in perspective on hover.
 * Skipped on touch devices. Transform-only so it stays on the compositor.
 */
export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
  (
    { children, className, max = 6, scale = 1.01, style, ...props },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const springRx = useSpring(rx, { stiffness: 180, damping: 20, mass: 0.5 });
    const springRy = useSpring(ry, { stiffness: 180, damping: 20, mass: 0.5 });

    const rotateX = useTransform(springRx, (v) => `${v}deg`);
    const rotateY = useTransform(springRy, (v) => `${v}deg`);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rx.set(-py * (max * 2));
      ry.set(px * (max * 2));
    };

    const handleLeave = () => {
      rx.set(0);
      ry.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ scale }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
          willChange: "transform",
          ...style,
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
TiltCard.displayName = "TiltCard";
