import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useBookingStore } from "@/stores/useBookingStore";
import { paymentsApi } from "@/api/payments.api";

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentForm({
  clientSecret,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    selectedFlight,
    passengers,
    selectedSeats,
    services,
    bookingId,
    getTotalPrice,
  } = useBookingStore();

  const totalPrice = getTotalPrice();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        onError(error.message ?? t("payment.failed"));
        toast.error(error.message ?? t("payment.failed"));
      } else if (paymentIntent?.status === "succeeded") {
        // Confirm payment on backend
        if (bookingId) {
          await paymentsApi.confirmPayment({
            paymentIntentId: paymentIntent.id,
            bookingId,
          });
        }
        toast.success(t("payment.success"));
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("payment.failed");
      onError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "hsl(var(--foreground))",
        "::placeholder": {
          color: "hsl(var(--muted-foreground))",
        },
      },
      invalid: {
        color: "hsl(var(--destructive))",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Payment Form */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("payment.cardDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} id="payment-form">
                <div className="rounded-md border p-4">
                  <CardElement options={cardElementOptions} />
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>{t("payment.secure")}</span>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="payment-form"
                className="w-full"
                size="lg"
                disabled={!stripe || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("payment.processing")}
                  </>
                ) : (
                  t("payment.payButton", {
                    amount: formatCurrency(totalPrice),
                  })
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("payment.orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flight */}
              {selectedFlight && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("payment.flight")}
                    </span>
                    <span>
                      {selectedFlight.originCode} -{" "}
                      {selectedFlight.destinationCode}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {passengers.length}x {t("flight.search.passengers")}
                    </span>
                    <span>
                      {formatCurrency(
                        selectedFlight.basePrice * Math.max(passengers.length, 1),
                        selectedFlight.currency
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Seats */}
              {selectedSeats.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("payment.seats")}
                      </span>
                      <span>
                        {formatCurrency(
                          selectedSeats.reduce((sum, s) => sum + s.price, 0)
                        )}
                      </span>
                    </div>
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex justify-between text-xs text-muted-foreground pl-4"
                      >
                        <span>
                          {seat.row}
                          {seat.column}
                        </span>
                        <span>{formatCurrency(seat.price)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Services */}
              {services.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("payment.services")}
                      </span>
                      <span>
                        {formatCurrency(
                          services.reduce((sum, s) => sum + s.price, 0)
                        )}
                      </span>
                    </div>
                    {services.map((service) => (
                      <div
                        key={service.type}
                        className="flex justify-between text-xs text-muted-foreground pl-4"
                      >
                        <span>
                          {t(`booking.services.${service.type.toLowerCase()}`)}
                        </span>
                        <span>{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between font-bold text-lg">
                <span>{t("payment.total")}</span>
                <span className="text-primary">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
