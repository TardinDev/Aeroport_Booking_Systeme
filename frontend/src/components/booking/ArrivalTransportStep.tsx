import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Car, KeyRound, Plane, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/useBookingStore";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import type {
  ArrivalTransport,
  ArrivalTransportKind,
  CarRentalDetails,
  TaxiPickupDetails,
} from "@/types";

const TAXI_BASE_PRICE_EUR = 42;
const RENTAL_DAILY_PRICE_EUR = 38;

const CAR_CLASSES: { value: CarRentalDetails["carClass"]; multiplier: number }[] = [
  { value: "ECONOMY", multiplier: 1 },
  { value: "COMPACT", multiplier: 1.15 },
  { value: "SUV", multiplier: 1.6 },
  { value: "PREMIUM", multiplier: 2.1 },
];

interface ArrivalTransportStepProps {
  onNext: () => void;
  onPrev: () => void;
}

/**
 * After choosing seats and entering passenger info, we ask the
 * traveller what they want waiting for them on the other side:
 * a driver with a name placard, or a self-drive rental car.
 * They can also skip this step.
 */
export function ArrivalTransportStep({ onNext, onPrev }: ArrivalTransportStepProps) {
  const { t } = useTranslation();
  const currency = useCurrencyStore((s) => s.code);
  const selectedFlight = useBookingStore((s) => s.selectedFlight);
  const arrivalTransport = useBookingStore((s) => s.arrivalTransport);
  const setArrivalTransport = useBookingStore((s) => s.setArrivalTransport);

  const [activeKind, setActiveKind] = useState<ArrivalTransportKind>(
    arrivalTransport?.kind ?? "NONE"
  );

  // Local form state — only persisted to the store on confirm.
  const defaultPlacardName = (() => {
    const passenger = useBookingStore.getState().passengers[0];
    return passenger ? `${passenger.firstName} ${passenger.lastName}`.trim() : "";
  })();

  const [taxiForm, setTaxiForm] = useState<TaxiPickupDetails>(
    arrivalTransport?.taxiDetails ?? {
      meetingPoint: t("booking.arrivalTransport.taxi.defaultMeetingPoint", {
        defaultValue: "Arrivals hall — exit gate",
      }),
      placardName: defaultPlacardName,
      contactPhone: "",
      dropoffAddress: selectedFlight?.destinationCity ?? "",
    }
  );

  const [rentalForm, setRentalForm] = useState<CarRentalDetails>(
    arrivalTransport?.rentalDetails ?? {
      carClass: "ECONOMY",
      pickupDate: selectedFlight?.arrivalTime?.slice(0, 10) ?? "",
      returnDate: "",
      returnLocation: "SAME",
    }
  );

  const rentalDays = (() => {
    if (!rentalForm.pickupDate || !rentalForm.returnDate) return 1;
    const start = new Date(rentalForm.pickupDate).getTime();
    const end = new Date(rentalForm.returnDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  })();

  const rentalMultiplier =
    CAR_CLASSES.find((c) => c.value === rentalForm.carClass)?.multiplier ?? 1;
  const rentalTotal = RENTAL_DAILY_PRICE_EUR * rentalMultiplier * rentalDays;

  const handleConfirm = () => {
    let next: ArrivalTransport | null = null;
    if (activeKind === "TAXI_PICKUP") {
      next = {
        kind: "TAXI_PICKUP",
        price: TAXI_BASE_PRICE_EUR,
        taxiDetails: taxiForm,
      };
    } else if (activeKind === "CAR_RENTAL") {
      next = {
        kind: "CAR_RENTAL",
        price: rentalTotal,
        rentalDetails: rentalForm,
      };
    }
    setArrivalTransport(next);
    onNext();
  };

  const handleSkip = () => {
    setArrivalTransport(null);
    onNext();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial header */}
      <div className="text-center">
        <p className="type-caption text-muted-foreground">
          {t("booking.arrivalTransport.eyebrow", {
            defaultValue: "Step IV · The other half",
          })}
        </p>
        <h2 className="font-semibold tracking-tight text-4xl md:text-5xl mt-2">
          {t("booking.arrivalTransport.title", {
            defaultValue: "What's waiting on the other side?",
          })}
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {t("booking.arrivalTransport.subtitle", {
            defaultValue:
              "A driver holding a placard with your name. Or a set of keys and an open road. Pick one — or skip and figure it out at the kerb.",
          })}
        </p>
      </div>

      {/* Two editorial choice cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taxi pickup card */}
        <ChoiceCard
          active={activeKind === "TAXI_PICKUP"}
          onClick={() =>
            setActiveKind(activeKind === "TAXI_PICKUP" ? "NONE" : "TAXI_PICKUP")
          }
          icon={<Plane className="h-5 w-5" />}
          eyebrow={t("booking.arrivalTransport.taxi.eyebrow", {
            defaultValue: "Driver with a placard",
          })}
          title={t("booking.arrivalTransport.taxi.title", {
            defaultValue: "Meet me at arrivals",
          })}
          description={t("booking.arrivalTransport.taxi.description", {
            defaultValue:
              "A driver waiting at your arrival gate with your name printed on a placard. Door-to-door, fixed fare.",
          })}
          priceLabel={t("booking.arrivalTransport.taxi.priceLabel", {
            defaultValue: "Flat fare",
          })}
          priceEur={TAXI_BASE_PRICE_EUR}
          currency={currency}
        />

        {/* Car rental card */}
        <ChoiceCard
          active={activeKind === "CAR_RENTAL"}
          onClick={() =>
            setActiveKind(activeKind === "CAR_RENTAL" ? "NONE" : "CAR_RENTAL")
          }
          icon={<KeyRound className="h-5 w-5" />}
          eyebrow={t("booking.arrivalTransport.rental.eyebrow", {
            defaultValue: "Self-drive rental",
          })}
          title={t("booking.arrivalTransport.rental.title", {
            defaultValue: "Keys at the airport",
          })}
          description={t("booking.arrivalTransport.rental.description", {
            defaultValue:
              "Pick up a rental car the moment you land — return it where you like, when you like.",
          })}
          priceLabel={t("booking.arrivalTransport.rental.priceLabel", {
            defaultValue: "From / day",
          })}
          priceEur={RENTAL_DAILY_PRICE_EUR}
          currency={currency}
        />
      </div>

      {/* Expanded form for the active choice */}
      <AnimatePresence mode="wait">
        {activeKind === "TAXI_PICKUP" && (
          <motion.div
            key="taxi-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="overflow-hidden rounded-xl bg-secondary">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
                <div className="p-6 md:p-8 space-y-5">
                  <div>
                    <p className="type-caption text-muted-foreground">
                      {t("booking.arrivalTransport.taxi.formTitle", {
                        defaultValue: "Driver brief",
                      })}
                    </p>
                    <p className="font-semibold tracking-tight text-2xl mt-1">
                      {t("booking.arrivalTransport.taxi.formSubtitle", {
                        defaultValue: "Tell us who to look for",
                      })}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow
                      label={t("booking.arrivalTransport.taxi.placardName", {
                        defaultValue: "Name on placard",
                      })}
                    >
                      <Input
                        value={taxiForm.placardName}
                        onChange={(e) =>
                          setTaxiForm((f) => ({ ...f, placardName: e.target.value }))
                        }
                        className="border border-border"
                      />
                    </FieldRow>
                    <FieldRow
                      label={t("booking.arrivalTransport.taxi.contactPhone", {
                        defaultValue: "Contact phone",
                      })}
                    >
                      <Input
                        value={taxiForm.contactPhone}
                        onChange={(e) =>
                          setTaxiForm((f) => ({ ...f, contactPhone: e.target.value }))
                        }
                        placeholder="+33 6 12 34 56 78"
                        className="border border-border"
                      />
                    </FieldRow>
                    <FieldRow
                      label={t("booking.arrivalTransport.taxi.meetingPoint", {
                        defaultValue: "Meeting point",
                      })}
                    >
                      <Input
                        value={taxiForm.meetingPoint}
                        onChange={(e) =>
                          setTaxiForm((f) => ({ ...f, meetingPoint: e.target.value }))
                        }
                        className="border border-border"
                      />
                    </FieldRow>
                    <FieldRow
                      label={t("booking.arrivalTransport.taxi.dropoffAddress", {
                        defaultValue: "Drop-off address",
                      })}
                    >
                      <Input
                        value={taxiForm.dropoffAddress}
                        onChange={(e) =>
                          setTaxiForm((f) => ({ ...f, dropoffAddress: e.target.value }))
                        }
                        placeholder={selectedFlight?.destinationCity}
                        className="border border-border"
                      />
                    </FieldRow>
                  </div>
                </div>

                {/* Tear-off price stub */}
                <PriceStub
                  label={t("booking.arrivalTransport.taxi.priceStubLabel", {
                    defaultValue: "Driver waiting · all-in",
                  })}
                  amountEur={TAXI_BASE_PRICE_EUR}
                  currency={currency}
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeKind === "CAR_RENTAL" && (
          <motion.div
            key="rental-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="overflow-hidden rounded-xl bg-secondary">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
                <div className="p-6 md:p-8 space-y-5">
                  <div>
                    <p className="type-caption text-muted-foreground">
                      {t("booking.arrivalTransport.rental.formTitle", {
                        defaultValue: "Rental brief",
                      })}
                    </p>
                    <p className="font-semibold tracking-tight text-2xl mt-1">
                      {t("booking.arrivalTransport.rental.formSubtitle", {
                        defaultValue: "Pick your wheels",
                      })}
                    </p>
                  </div>

                  {/* Car class radio cards */}
                  <div>
                    <p className="type-caption text-muted-foreground mb-2">
                      {t("booking.arrivalTransport.rental.carClass", {
                        defaultValue: "Car class",
                      })}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CAR_CLASSES.map((opt) => {
                        const isActive = rentalForm.carClass === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setRentalForm((f) => ({ ...f, carClass: opt.value }))
                            }
                            className={cn(
                              "type-caption border border-border px-3 py-2 text-sm transition-all",
                              isActive
                                ? "bg-foreground text-background "
                                : "bg-background text-foreground "
                            )}
                          >
                            {t(`booking.arrivalTransport.rental.classes.${opt.value}`, {
                              defaultValue: opt.value,
                            })}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldRow
                      label={t("booking.arrivalTransport.rental.pickupDate", {
                        defaultValue: "Pickup date",
                      })}
                    >
                      <Input
                        type="date"
                        value={rentalForm.pickupDate}
                        onChange={(e) =>
                          setRentalForm((f) => ({ ...f, pickupDate: e.target.value }))
                        }
                        className="border border-border"
                      />
                    </FieldRow>
                    <FieldRow
                      label={t("booking.arrivalTransport.rental.returnDate", {
                        defaultValue: "Return date",
                      })}
                    >
                      <Input
                        type="date"
                        value={rentalForm.returnDate}
                        onChange={(e) =>
                          setRentalForm((f) => ({ ...f, returnDate: e.target.value }))
                        }
                        className="border border-border"
                      />
                    </FieldRow>
                  </div>

                  <FieldRow
                    label={t("booking.arrivalTransport.rental.returnLocation", {
                      defaultValue: "Return location",
                    })}
                  >
                    <div className="flex gap-2">
                      {(["SAME", "DIFFERENT"] as const).map((loc) => {
                        const isActive = rentalForm.returnLocation === loc;
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() =>
                              setRentalForm((f) => ({ ...f, returnLocation: loc }))
                            }
                            className={cn(
                              "type-caption border border-border px-4 py-2 text-sm",
                              isActive
                                ? "bg-foreground text-background"
                                : "bg-background text-foreground"
                            )}
                          >
                            {t(`booking.arrivalTransport.rental.return.${loc}`, {
                              defaultValue: loc,
                            })}
                          </button>
                        );
                      })}
                    </div>
                  </FieldRow>
                </div>

                <PriceStub
                  label={t("booking.arrivalTransport.rental.priceStubLabel", {
                    defaultValue: "Rental · ${{days}} day(s)",
                    days: rentalDays,
                  })}
                  amountEur={rentalTotal}
                  currency={currency}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step navigation */}
      <div className="border-t border-border flex flex-wrap items-center justify-between gap-3 pt-6">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="type-caption text-foreground hover:bg-foreground/5"
        >
          {t("common.previous")}
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="type-caption text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            {t("booking.arrivalTransport.skip", {
              defaultValue: "Skip — I'll figure it out",
            })}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={activeKind === "NONE"}
            className="type-caption border border-border bg-foreground text-background transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {activeKind === "NONE"
              ? t("booking.arrivalTransport.pickOne", {
                  defaultValue: "Pick one to continue",
                })
              : t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface ChoiceCardProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  priceLabel: string;
  priceEur: number;
  currency: string;
}

function ChoiceCard({
  active,
  onClick,
  icon,
  eyebrow,
  title,
  description,
  priceLabel,
  priceEur,
  currency,
}: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative text-left border border-border bg-card p-6 transition-shadow",
        active
          ? ""
          : ""
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center border border-border",
            active ? "bg-link text-background" : "bg-background text-foreground"
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="type-caption text-muted-foreground">{eyebrow}</p>
          <p className="font-semibold tracking-tight text-2xl leading-tight mt-1">{title}</p>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>
      </div>

      <div className="border-t border-border mt-5 flex items-end justify-between pt-4">
        <p className="type-caption text-muted-foreground">{priceLabel}</p>
        <p className="font-semibold tracking-tight text-2xl tabular-nums">
          {formatCurrency(priceEur, currency)}
        </p>
      </div>

      {active && (
        <motion.div
          layoutId="arrival-transport-active-stamp"
          className="absolute -top-3 -right-3 rotate-3 bg-link text-background px-3 py-1 type-caption text-xs border border-border "
        >
          Selected
        </motion.div>
      )}
    </motion.button>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="type-caption text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PriceStub({
  label,
  amountEur,
  currency,
}: {
  label: string;
  amountEur: number;
  currency: string;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-4 border-t border-border p-6 md:min-w-[200px] md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:p-8">
      <div className="md:text-right">
        <p className="type-caption">{label}</p>
        <p className="font-semibold tracking-tight text-3xl leading-none mt-1">
          {formatCurrency(amountEur, currency)}
        </p>
      </div>
      <p className="type-caption md:mt-3">
        <Car className="inline h-3 w-3 mr-1" />
        Door-to-door
      </p>
    </div>
  );
}
