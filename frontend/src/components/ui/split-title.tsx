import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Ordered segments. `italic: true` renders the segment in the italic
   * serif (Instrument Serif) — perfect for "Th e art / of *taking* off."
   */
  segments: Array<{
    text: string;
    italic?: boolean;
    tone?: "ink" | "coral" | "navy";
    break?: boolean;
  }>;
  as?: "h1" | "h2" | "h3";
}

/**
 * SplitTitle — huge editorial display title composed of mixed-weight
 * segments. Supports italic accents and line breaks per segment.
 */
export const SplitTitle = React.forwardRef<HTMLElement, SplitTitleProps>(
  ({ segments, as: Tag = "h1", className, ...props }, ref) => {
    const toneClass: Record<NonNullable<SplitTitleProps["segments"][number]["tone"]>, string> = {
      ink: "text-ink",
      coral: "text-coral",
      navy: "text-navy",
    };

    return React.createElement(
      Tag,
      {
        ref,
        className: cn("display-serif text-balance", className),
        ...props,
      },
      segments.map((segment, i) => (
        <React.Fragment key={i}>
          <span
            className={cn(
              segment.italic && "display-serif-italic",
              segment.tone && toneClass[segment.tone]
            )}
          >
            {segment.text}
          </span>
          {segment.break && <br />}
          {!segment.break && i < segments.length - 1 && " "}
        </React.Fragment>
      ))
    );
  }
);
SplitTitle.displayName = "SplitTitle";
