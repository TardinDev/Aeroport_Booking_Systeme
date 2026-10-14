import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { Seat, SeatClass } from "@/types";

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  maxSelections: number;
  onSeatSelect: (seat: Seat) => void;
  onSeatDeselect: (seatId: string) => void;
}

const COLUMNS = ["A", "B", "C", "", "D", "E", "F"];

const seatColorMap: Record<string, string> = {
  AVAILABLE: "fill-success hover:fill-success/80 cursor-pointer",
  OCCUPIED: "fill-gray-300 dark:fill-gray-600 cursor-not-allowed",
  SELECTED: "fill-primary hover:fill-link-hover cursor-pointer",
  BLOCKED: "fill-gray-200 dark:fill-gray-700 cursor-not-allowed",
};

const classColorMap: Record<SeatClass, string> = {
  FIRST: "fill-amber-500 hover:fill-amber-400",
  BUSINESS: "fill-purple-500 hover:fill-purple-400",
  ECONOMY: "",
};

function getSeatColor(seat: Seat, isSelected: boolean): string {
  if (isSelected) return seatColorMap.SELECTED;
  if (seat.status === "OCCUPIED" || seat.status === "BLOCKED") {
    return seatColorMap[seat.status];
  }
  if (seat.seatClass !== "ECONOMY") {
    return classColorMap[seat.seatClass] + " cursor-pointer";
  }
  return seatColorMap.AVAILABLE;
}

export function SeatMap({
  seats,
  selectedSeats,
  maxSelections,
  onSeatSelect,
  onSeatDeselect,
}: SeatMapProps) {
  const { t } = useTranslation();

  const selectedSeatIds = new Set(selectedSeats.map((s) => s.id));

  const rows = Array.from(new Set(seats.map((s) => s.row))).sort(
    (a, b) => a - b
  );

  const seatsByPosition = new Map<string, Seat>();
  seats.forEach((seat) => {
    seatsByPosition.set(`${seat.row}-${seat.column}`, seat);
  });

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "OCCUPIED" || seat.status === "BLOCKED") return;

    if (selectedSeatIds.has(seat.id)) {
      onSeatDeselect(seat.id);
    } else if (selectedSeats.length < maxSelections) {
      onSeatSelect(seat);
    }
  };

  const seatWidth = 32;
  const seatHeight = 32;
  const gap = 4;
  const aisleWidth = 24;
  const rowHeight = seatHeight + gap;

  const totalWidth = COLUMNS.length * (seatWidth + gap) + aisleWidth + 60;
  const totalHeight = rows.length * rowHeight + 120;

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-success" />
          <span className="text-xs">{t("booking.seats.legend.available")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-gray-300 dark:bg-gray-600" />
          <span className="text-xs">{t("booking.seats.legend.occupied")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-primary" />
          <span className="text-xs">{t("booking.seats.legend.selected")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-amber-500" />
          <span className="text-xs">{t("booking.seats.legend.premium")}</span>
        </div>
      </div>

      {/* Seat Map SVG */}
      <div className="flex justify-center overflow-x-auto">
        <TooltipProvider>
          <svg
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            className="max-w-md w-full"
            role="img"
            aria-label="Airplane seat map"
          >
            {/* Airplane nose */}
            <path
              d={`M ${totalWidth / 2 - 60} 40 Q ${totalWidth / 2} 0 ${totalWidth / 2 + 60} 40`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
            />

            {/* Column headers */}
            {COLUMNS.map((col, colIndex) => {
              if (!col) return null;
              const x = 30 + colIndex * (seatWidth + gap) + seatWidth / 2;
              return (
                <text
                  key={`header-${col}`}
                  x={x}
                  y={60}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs font-medium"
                  fontSize="12"
                >
                  {col}
                </text>
              );
            })}

            {/* Seats */}
            {rows.map((row, rowIndex) => (
              <g key={row}>
                {/* Row number */}
                <text
                  x={12}
                  y={80 + rowIndex * rowHeight + seatHeight / 2 + 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                  fontSize="10"
                >
                  {row}
                </text>

                {COLUMNS.map((col, colIndex) => {
                  if (!col) return null;

                  const seat = seatsByPosition.get(`${row}-${col}`);
                  if (!seat) return null;

                  const isSelected = selectedSeatIds.has(seat.id);
                  const x = 30 + colIndex * (seatWidth + gap);
                  const y = 70 + rowIndex * rowHeight;

                  return (
                    <Tooltip key={seat.id}>
                      <TooltipTrigger asChild>
                        <motion.rect
                          x={x}
                          y={y}
                          width={seatWidth}
                          height={seatHeight}
                          rx={4}
                          className={cn(
                            "transition-colors stroke-background stroke-1",
                            getSeatColor(seat, isSelected)
                          )}
                          onClick={() => handleSeatClick(seat)}
                          whileHover={
                            seat.status === "AVAILABLE" || isSelected
                              ? { scale: 1.1 }
                              : {}
                          }
                          whileTap={
                            seat.status === "AVAILABLE" || isSelected
                              ? { scale: 0.95 }
                              : {}
                          }
                          style={{
                            transformOrigin: `${x + seatWidth / 2}px ${y + seatHeight / 2}px`,
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <p className="font-medium">
                            {t("booking.seats.info.row")} {seat.row},{" "}
                            {t("booking.seats.info.seat")} {seat.column}
                          </p>
                          <p>{t(`flight.class.${seat.seatClass}`)}</p>
                          <p className="font-medium">
                            {formatCurrency(seat.price)}
                          </p>
                          {seat.isWindow && (
                            <Badge variant="outline" className="text-xs">
                              {t("booking.seats.info.window")}
                            </Badge>
                          )}
                          {seat.isAisle && (
                            <Badge variant="outline" className="text-xs">
                              {t("booking.seats.info.aisle")}
                            </Badge>
                          )}
                          {seat.isExit && (
                            <Badge variant="warning" className="text-xs">
                              {t("booking.seats.info.exit")}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </g>
            ))}
          </svg>
        </TooltipProvider>
      </div>

      {/* Selected Seats Summary */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{t("booking.seats.selected")}</h4>
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("booking.seats.noSelection")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <motion.div
                key={seat.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => onSeatDeselect(seat.id)}
                >
                  {seat.row}
                  {seat.column} - {formatCurrency(seat.price)}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
