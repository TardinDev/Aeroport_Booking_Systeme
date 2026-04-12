import * as React from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Locale used for the final formatted number. */
  locale?: string;
}

/**
 * NumberTicker — smooth count-up/down animation (2026).
 * Uses a spring + useInView so it only triggers once the element is visible.
 * Respects prefers-reduced-motion via the index.css global override.
 */
export const NumberTicker = React.forwardRef<
  HTMLSpanElement,
  NumberTickerProps
>(
  (
    {
      value,
      direction = "up",
      delay = 0,
      decimals = 0,
      prefix = "",
      suffix = "",
      locale = "en-US",
      className,
      ...props
    },
    forwardedRef
  ) => {
    const localRef = React.useRef<HTMLSpanElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => localRef.current as HTMLSpanElement
    );

    const motionValue: MotionValue<number> = useMotionValue(
      direction === "down" ? value : 0
    );
    const springValue = useSpring(motionValue, {
      damping: 60,
      stiffness: 120,
    });
    const isInView = useInView(localRef, { once: true, margin: "-10%" });

    React.useEffect(() => {
      if (!isInView) return;
      const timeout = window.setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
      return () => window.clearTimeout(timeout);
    }, [motionValue, isInView, delay, value, direction]);

    React.useEffect(() => {
      const unsubscribe = springValue.on("change", (latest) => {
        if (!localRef.current) return;
        localRef.current.textContent =
          prefix +
          Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(Number(latest.toFixed(decimals))) +
          suffix;
      });
      return () => unsubscribe();
    }, [springValue, decimals, prefix, suffix, locale]);

    return (
      <span
        ref={localRef}
        className={cn("tabular-nums tracking-tight", className)}
        {...props}
      >
        {prefix}0{suffix}
      </span>
    );
  }
);
NumberTicker.displayName = "NumberTicker";
