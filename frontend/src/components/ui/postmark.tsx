import * as React from "react";
import { cn } from "@/lib/utils";

interface PostmarkProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Primary line — usually the city/airport code, e.g. "CDG → JFK" */
  label: string;
  /** Secondary line — a date or small caption */
  sublabel?: string;
  rotate?: number;
  tone?: "red" | "ink" | "navy" | "gold";
  size?: "sm" | "md" | "lg";
}

/**
 * Postmark — a rotated vintage stamp/postmark badge. Purely decorative,
 * aria-hidden by default. Use over photos, cards, or section corners.
 */
export const Postmark = React.forwardRef<HTMLDivElement, PostmarkProps>(
  (
    {
      label,
      sublabel,
      rotate = -14,
      tone = "red",
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) => {
    const toneClass: Record<NonNullable<PostmarkProps["tone"]>, string> = {
      red: "text-postmark border-postmark",
      ink: "text-ink border-ink",
      navy: "text-navy border-navy",
      gold: "text-gold border-gold",
    };

    const sizeClass: Record<NonNullable<PostmarkProps["size"]>, string> = {
      sm: "px-3 py-1.5 text-[0.55rem]",
      md: "px-4 py-2 text-[0.65rem]",
      lg: "px-5 py-2.5 text-xs",
    };

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-flex select-none flex-col items-center justify-center rounded-sm border-2 border-dashed bg-paper/20 font-mono font-bold uppercase tracking-widest backdrop-blur-sm",
          "[box-shadow:inset_0_0_0_1px_currentColor]",
          toneClass[tone],
          sizeClass[size],
          className
        )}
        style={{
          transform: `rotate(${rotate}deg)`,
          ...style,
        }}
        {...props}
      >
        <span className="whitespace-nowrap">{label}</span>
        {sublabel && (
          <span className="mt-0.5 text-[0.5rem] font-medium tracking-wider opacity-80">
            {sublabel}
          </span>
        )}
      </div>
    );
  }
);
Postmark.displayName = "Postmark";
