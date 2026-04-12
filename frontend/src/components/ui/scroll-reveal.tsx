import * as React from "react";
import {
  motion,
  useInView,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  /** Amount of the target visible before triggering (0 → 1). */
  amount?: number;
  as?: "div" | "section" | "article" | "header" | "footer";
}

/**
 * ScrollReveal — fades and slides children into view once they enter the
 * viewport. Respects prefers-reduced-motion via the global override.
 */
export const ScrollReveal = React.forwardRef<
  HTMLDivElement,
  ScrollRevealProps
>(
  (
    {
      children,
      className,
      delay = 0,
      duration = 0.6,
      y = 24,
      once = true,
      amount = 0.2,
      as = "div",
      ...props
    },
    forwardedRef
  ) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => localRef.current as HTMLDivElement
    );
    const isInView = useInView(localRef, { once, amount });

    const variants: Variants = {
      hidden: { opacity: 0, y },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    };

    const MotionTag = motion[as] as typeof motion.div;

    return (
      <MotionTag
        ref={localRef}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={variants}
        className={cn(className)}
        {...props}
      >
        {children}
      </MotionTag>
    );
  }
);
ScrollReveal.displayName = "ScrollReveal";
