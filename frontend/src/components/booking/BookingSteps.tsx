import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BookingStep } from "@/stores/useBookingStore";

const STEPS: { key: BookingStep; translationKey: string }[] = [
  { key: "SELECT_SEATS", translationKey: "booking.steps.selectSeats" },
  { key: "PASSENGER_INFO", translationKey: "booking.steps.passengerInfo" },
  { key: "ARRIVAL_TRANSPORT", translationKey: "booking.steps.arrivalTransport" },
  { key: "SERVICES", translationKey: "booking.steps.services" },
  { key: "PAYMENT", translationKey: "booking.steps.payment" },
  { key: "CONFIRMATION", translationKey: "booking.steps.confirmation" },
];

interface BookingStepsProps {
  currentStep: BookingStep;
}

export function BookingSteps({ currentStep }: BookingStepsProps) {
  const { t } = useTranslation();

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? "hsl(var(--primary))"
                      : isCurrent
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))",
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isCompleted || isCurrent
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    index + 1
                  )}
                </motion.div>
                <span
                  className={cn(
                    "mt-2 text-xs text-center hidden sm:block max-w-[80px]",
                    isCurrent
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {t(step.translationKey)}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-px relative">
                  <div className="absolute inset-0 bg-muted" />
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 bg-primary"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
