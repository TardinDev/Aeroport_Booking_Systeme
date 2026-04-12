import * as React from "react";
import { cn } from "@/lib/utils";

interface DropCapProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Number of leading lines the drop cap should span visually. */
  lines?: number;
  tone?: "coral" | "ink" | "navy";
}

/**
 * DropCap — editorial first-paragraph treatment. Uses the `.drop-cap`
 * pseudo-element from index.css by default, but can be customized with
 * a tone prop for coral/ink/navy first letters.
 */
export const DropCap = React.forwardRef<HTMLParagraphElement, DropCapProps>(
  ({ children, className, tone = "coral", ...props }, ref) => {
    const toneClass: Record<NonNullable<DropCapProps["tone"]>, string> = {
      coral: "[&::first-letter]:text-coral",
      ink: "[&::first-letter]:text-ink",
      navy: "[&::first-letter]:text-navy",
    };

    return (
      <p
        ref={ref}
        className={cn(
          "body-serif drop-cap text-pretty",
          toneClass[tone],
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
DropCap.displayName = "DropCap";
