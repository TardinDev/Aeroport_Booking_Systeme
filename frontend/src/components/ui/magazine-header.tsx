import * as React from "react";
import { cn } from "@/lib/utils";

interface MagazineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  volume?: string;
  issue?: string;
  date?: string;
  edition?: string;
  price?: string;
}

/**
 * MagazineHeader — thin dateline row used at the very top of editorial
 * pages. Evokes a newspaper/magazine masthead metadata strip:
 * "VOL. XXIV · N° 37 · PARIS EDITION · APRIL 2026 · €2.50"
 */
export const MagazineHeader = React.forwardRef<
  HTMLDivElement,
  MagazineHeaderProps
>(
  (
    {
      className,
      volume = "XXIV",
      issue = "37",
      date = "APRIL 2026",
      edition = "PARIS EDITION",
      price,
      ...props
    },
    ref
  ) => {
    const items = [
      `VOL. ${volume}`,
      `N° ${issue}`,
      edition,
      date,
      price,
    ].filter(Boolean) as string[];

    return (
      <div
        ref={ref}
        className={cn(
          "small-caps flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-ink-faded",
          className
        )}
        {...props}
      >
        {items.map((item, i) => (
          <React.Fragment key={`${item}-${i}`}>
            {i > 0 && (
              <span aria-hidden="true" className="text-ink-faded/50">
                ·
              </span>
            )}
            <span>{item}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }
);
MagazineHeader.displayName = "MagazineHeader";
