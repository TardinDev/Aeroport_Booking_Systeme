import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Luggage, Shield, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BookingSteps } from "@/components/booking/BookingSteps";
import { ArrivalTransportStep } from "@/components/booking/ArrivalTransportStep";
import { SeatMap } from "@/components/seats/SeatMap";
import { PassengerForm } from "@/components/booking/PassengerForm";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { BaggageService } from "@/components/services/BaggageService";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingStore } from "@/stores/useBookingStore";
import { flightsApi } from "@/api/flights.api";
import { bookingsApi } from "@/api/bookings.api";
import { paymentsApi } from "@/api/payments.api";
import type { Passenger, Seat } from "@/types";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

export function BookingPage() {
  const { t } = useTranslation();
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const {
    selectedFlight,
    passengers,
    selectedSeats,
    services,
    currentStep,
    setFlight,
    selectSeat,
    deselectSeat,
    addPassenger,
    addService,
    removeService,
    nextStep,
    prevStep,
    setBookingId,
    setBookingReference,
    getTotalPrice,
  } = useBookingStore();

  // Fetch flight details
  const { data: flight, isLoading: flightLoading } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: () => flightsApi.getFlightById(flightId!),
    enabled: !!flightId && !selectedFlight,
  });

  // Fetch seats
  const { data: seats = [], isLoading: seatsLoading } = useQuery({
    queryKey: ["seats", flightId],
    queryFn: () => flightsApi.getFlightSeats(flightId!),
    enabled: !!flightId && currentStep === "SELECT_SEATS",
  });

  useEffect(() => {
    if (flight && !selectedFlight) {
      setFlight(flight);
    }
  }, [flight, selectedFlight, setFlight]);

  // Handle going to non-valid step without flight
  useEffect(() => {
    if (!flightId) {
      navigate("/flights");
    }
  }, [flightId, navigate]);

  const handleSeatSelect = (seat: Seat) => {
    selectSeat(seat);
  };

  const handleSeatDeselect = (seatId: string) => {
    deselectSeat(seatId);
  };

  const handlePassengersSubmit = (newPassengers: Passenger[]) => {
    // Clear and re-add passengers
    newPassengers.forEach((p) => addPassenger(p));
    nextStep();
  };

  const handleServicesNext = () => {
    nextStep();
  };

  const handleCreateBooking = async () => {
    if (!selectedFlight) return;

    try {
      const booking = await bookingsApi.createBooking({
        flightId: selectedFlight.id,
        passengers,
        seatIds: selectedSeats.map((s) => s.id),
        services,
      });

      setBookingId(booking.id);
      setBookingReference(booking.bookingReference);

      // Create payment intent
      const paymentIntent = await paymentsApi.createPaymentIntent({
        bookingId: booking.id,
        amount: getTotalPrice(),
        currency: selectedFlight.currency || "EUR",
      });

      setClientSecret(paymentIntent.clientSecret);
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  useEffect(() => {
    if (currentStep === "PAYMENT" && !clientSecret) {
      handleCreateBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handlePaymentSuccess = () => {
    nextStep(); // Go to CONFIRMATION
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  if (flightLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Booking Steps */}
      <div className="mb-8">
        <BookingSteps currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* SELECT SEATS */}
        {currentStep === "SELECT_SEATS" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("booking.seats.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                {seatsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <SeatMap
                    seats={seats}
                    selectedSeats={selectedSeats}
                    maxSelections={Math.max(passengers.length, 1)}
                    onSeatSelect={handleSeatSelect}
                    onSeatDeselect={handleSeatDeselect}
                  />
                )}
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                {t("common.previous")}
              </Button>
              <Button onClick={nextStep}>{t("common.next")}</Button>
            </div>
          </div>
        )}

        {/* PASSENGER INFO */}
        {currentStep === "PASSENGER_INFO" && (
          <div className="max-w-3xl mx-auto">
            <PassengerForm
              initialPassengers={passengers}
              maxPassengers={selectedFlight?.availableSeats ?? 9}
              onSubmit={handlePassengersSubmit}
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={prevStep}
            >
              {t("common.previous")}
            </Button>
          </div>
        )}

        {/* ARRIVAL TRANSPORT — taxi pickup or car rental */}
        {currentStep === "ARRIVAL_TRANSPORT" && (
          <ArrivalTransportStep onNext={nextStep} onPrev={prevStep} />
        )}

        {/* SERVICES — baggage / insurance / priority boarding */}
        {currentStep === "SERVICES" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">
                {t("booking.services.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("booking.services.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ServiceCard
                icon={Luggage}
                title={t("booking.services.baggage")}
                description={t("home.services.baggage.description")}
                price={25}
                isAdded={services.some((s) => s.type === "BAGGAGE")}
                onToggle={() => {
                  if (services.some((s) => s.type === "BAGGAGE")) {
                    removeService("BAGGAGE");
                  } else {
                    addService({
                      type: "BAGGAGE",
                      price: 25,
                      details: {},
                    });
                  }
                }}
              />
              <ServiceCard
                icon={Shield}
                title={t("booking.services.insurance")}
                description={t("home.services.insurance.description")}
                price={15}
                isAdded={services.some((s) => s.type === "INSURANCE")}
                onToggle={() => {
                  if (services.some((s) => s.type === "INSURANCE")) {
                    removeService("INSURANCE");
                  } else {
                    addService({
                      type: "INSURANCE",
                      price: 15,
                      details: {},
                    });
                  }
                }}
              />
              <ServiceCard
                icon={Star}
                title={t("booking.services.priorityBoarding")}
                description={t("home.services.checkin.description")}
                price={10}
                isAdded={services.some(
                  (s) => s.type === "PRIORITY_BOARDING"
                )}
                onToggle={() => {
                  if (
                    services.some((s) => s.type === "PRIORITY_BOARDING")
                  ) {
                    removeService("PRIORITY_BOARDING");
                  } else {
                    addService({
                      type: "PRIORITY_BOARDING",
                      price: 10,
                      details: {},
                    });
                  }
                }}
              />
            </div>

            {/* Expandable baggage section */}
            {services.some((s) => s.type === "BAGGAGE") && (
              <BaggageService
                onUpdate={(bags) => {
                  const totalPrice = bags.reduce((s, b) => s + b.price, 0);
                  addService({
                    type: "BAGGAGE",
                    price: totalPrice,
                    details: { bags },
                  });
                }}
              />
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                {t("common.previous")}
              </Button>
              <Button onClick={handleServicesNext}>
                {t("common.next")}
              </Button>
            </div>
          </div>
        )}

        {/* PAYMENT */}
        {currentStep === "PAYMENT" && (
          <div className="max-w-5xl mx-auto">
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <Button
              variant="outline"
              className="mt-6"
              onClick={prevStep}
            >
              {t("common.previous")}
            </Button>
          </div>
        )}

        {/* CONFIRMATION */}
        {currentStep === "CONFIRMATION" && <BookingConfirmation />}
      </motion.div>
    </div>
  );
}
