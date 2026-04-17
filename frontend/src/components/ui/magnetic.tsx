import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticProps extends HTMLMotionProps<"div"> {
  strength?: number;
}

/**
 * Subtle magnetic hover — child translates toward the cursor on mousemove,
 * resets on leave. Uses spring for organic feel. GPU-only (transform).
 * Pointer-coarse (touch) devices skip the effect.
 */
export const Magnetic = React.forwardRef<HTMLDivElement, MagneticProps>(
  ({ strength = 18, className, children, ...props }, forwardedRef) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
    const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      x.set((relX / rect.width) * strength);
      y.set((relY / rect.height) * strength);
    };

    const handleLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ x: springX, y: springY }}
        className={cn("inline-block", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
Magnetic.displayName = "Magnetic";
