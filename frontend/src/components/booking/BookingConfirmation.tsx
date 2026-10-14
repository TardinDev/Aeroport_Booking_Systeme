import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, Download, LayoutDashboard, Plane, PlaneTakeoff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { useBookingStore } from "@/stores/useBookingStore";

export function BookingConfirmation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    selectedFlight,
    passengers,
    services,
    bookingReference,
    getTotalPrice,
    reset,
  } = useBookingStore();

  const handleBackToDashboard = () => {
    reset();
    navigate("/dashboard");
  };

  const handleBookAnother = () => {
    reset();
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.4,
          }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
        >
          <Check className="h-10 w-10 text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold">
            {t("booking.confirmation.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("booking.confirmation.subtitle")}
          </p>
        </motion.div>
      </motion.div>

      {/* Booking Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("booking.confirmation.reference")}
            </p>
            <p className="text-3xl font-bold text-primary mt-1">
              {bookingReference ?? "------"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Flight Summary */}
      {selectedFlight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlaneTakeoff className="h-5 w-5" />
                {t("booking.confirmation.flightSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {selectedFlight.airlineName}
                  </span>
                  <Badge variant="outline">{selectedFlight.flightNumber}</Badge>
                </div>
                <Badge>{t(`flight.class.${selectedFlight.seatClass}`)}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {selectedFlight.originCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFlight.originCity}
                  </p>
                  <p className="text-sm">
                    {formatTime(selectedFlight.departureTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedFlight.departureTime)}
                  </p>
                </div>
                <div className="text-center text-muted-foreground">
                  <Plane className="h-5 w-5 mx-auto" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {selectedFlight.destinationCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFlight.destinationCity}
                  </p>
                  <p className="text-sm">
                    {formatTime(selectedFlight.arrivalTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedFlight.arrivalTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Passengers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("booking.confirmation.passengers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {passenger.email}
                    </p>
                  </div>
                  {passenger.seatId && (
                    <Badge variant="secondary">{passenger.seatId}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Price */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("payment.flight")}</span>
                <span>
                  {formatCurrency(
                    (selectedFlight?.basePrice ?? 0) *
                      Math.max(passengers.length, 1),
                    selectedFlight?.currency
                  )}
                </span>
              </div>
              {services.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("payment.services")}</span>
                  <span>
                    {formatCurrency(
                      services.reduce((sum, s) => sum + s.price, 0)
                    )}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t("booking.confirmation.totalPrice")}</span>
                <span className="text-primary">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button variant="outline" className="flex-1" onClick={handleBackToDashboard}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          {t("booking.confirmation.backToDashboard")}
        </Button>
        <Button className="flex-1" onClick={handleBookAnother}>
          <PlaneTakeoff className="mr-2 h-4 w-4" />
          {t("booking.confirmation.bookAnother")}
        </Button>
      </motion.div>

      {/* Download Boarding Pass */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="text-center"
      >
        <Button variant="link">
          <Download className="mr-2 h-4 w-4" />
          {t("booking.confirmation.downloadBoardingPass")}
        </Button>
      </motion.div>
    </div>
  );
}
