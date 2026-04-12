import * as React from "react";
import { cn } from "@/lib/utils";

interface TicketStubProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position of the perforated divider, in % from left (horizontal) or top (vertical). */
  perforationAt?: number;
  orientation?: "horizontal" | "vertical";
}

/**
 * TicketStub — a boarding-pass / luggage-tag shaped card with a perforated
 * divider. The caller provides two logical zones via flex/grid layout; the
 * perforation is purely visual (SVG + semicircle notches).
 *
 * Pair with editorial typography and mono flight codes for maximum effect.
 */
export const TicketStub = React.forwardRef<HTMLDivElement, TicketStubProps>(
  (
    {
      className,
      children,
      perforationAt = 72,
      orientation = "horizontal",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative border-2 border-ink bg-card",
          "shadow-[6px_6px_0_0_var(--ink)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          className
        )}
        {...props}
      >
        {/* Perforation divider */}
        {orientation === "horizontal" ? (
          <>
            {/* top notch */}
            <span
              aria-hidden="true"
              className="absolute -top-3 z-10 h-6 w-6 rounded-full border-2 border-ink bg-background"
              style={{ left: `calc(${perforationAt}% - 0.75rem)` }}
            />
            {/* bottom notch */}
            <span
              aria-hidden="true"
              className="absolute -bottom-3 z-10 h-6 w-6 rounded-full border-2 border-ink bg-background"
              style={{ left: `calc(${perforationAt}% - 0.75rem)` }}
            />
            {/* dashed line */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 border-l-2 border-dashed border-ink/60"
              style={{ left: `${perforationAt}%` }}
            />
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute -left-3 z-10 h-6 w-6 rounded-full border-2 border-ink bg-background"
              style={{ top: `calc(${perforationAt}% - 0.75rem)` }}
            />
            <span
              aria-hidden="true"
              className="absolute -right-3 z-10 h-6 w-6 rounded-full border-2 border-ink bg-background"
              style={{ top: `calc(${perforationAt}% - 0.75rem)` }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0 border-t-2 border-dashed border-ink/60"
              style={{ top: `${perforationAt}%` }}
            />
          </>
        )}

        {children}
      </div>
    );
  }
);
TicketStub.displayName = "TicketStub";
