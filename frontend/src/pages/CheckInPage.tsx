import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plane,
  CheckCircle2,
  Download,
  QrCode,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { bookingsApi } from "@/api/bookings.api";
import { checkInApi } from "@/api/checkin.api";
import { formatDate, formatTime } from "@/lib/utils";

export function CheckInPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingsApi.getBookingById(bookingId!),
    enabled: Boolean(bookingId),
  });

  const checkInMutation = useMutation({
    mutationFn: () => checkInApi.checkIn(bookingId!),
    onSuccess: () => {
      toast.success("Check-in completed! Your boarding passes are ready.");
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Check-in failed. Please try again.");
    },
  });

  const handleDownloadPdf = async (passengerId: string, name: string) => {
    if (!bookingId) return;
    try {
      setDownloadingId(passengerId);
      const blob = await checkInApi.downloadBoardingPassPdf(
        bookingId,
        passengerId
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `boarding-pass-${name.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download boarding pass PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Booking not found</p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canCheckIn =
    booking.status === "CONFIRMED" &&
    new Date(booking.flight.departureTime) > new Date();
  const alreadyCheckedIn = booking.status === "COMPLETED";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Online Check-in</h1>
        <p className="text-muted-foreground">
          Booking reference{" "}
          <span className="font-mono font-semibold">
            {booking.bookingReference}
          </span>
        </p>
      </motion.div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                {booking.flight.flightNumber} — {booking.flight.airlineName}
              </CardTitle>
              <CardDescription>
                {booking.flight.originCity} ({booking.flight.originCode}) →{" "}
                {booking.flight.destinationCity} (
                {booking.flight.destinationCode})
              </CardDescription>
            </div>
            <Badge variant={alreadyCheckedIn ? "success" : "secondary"}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">
                {formatDate(booking.flight.departureTime)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Departure</p>
              <p className="font-medium">
                {formatTime(booking.flight.departureTime)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Arrival</p>
              <p className="font-medium">
                {formatTime(booking.flight.arrivalTime)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Passengers</p>
              <p className="font-medium">{booking.passengers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!alreadyCheckedIn && (
        <Card className="mb-6">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">
                  {canCheckIn
                    ? "Ready for online check-in"
                    : "Check-in not yet available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {canCheckIn
                    ? "Get your boarding passes now."
                    : "Check-in opens 48h before departure for confirmed bookings."}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              disabled={!canCheckIn || checkInMutation.isPending}
              onClick={() => checkInMutation.mutate()}
            >
              {checkInMutation.isPending ? "Checking in..." : "Check in now"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Boarding passes</CardTitle>
          <CardDescription>
            Download your boarding passes as PDF with a scannable QR code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {booking.passengers.map((passenger, index) => {
              const passengerId = (passenger as Passenger & { id?: string }).id ?? String(index);
              const fullName = `${passenger.firstName} ${passenger.lastName}`;
              return (
                <motion.div
                  key={passengerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <QrCode className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {passenger.seatId ? `Seat ${passenger.seatId}` : "No seat assigned"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      !alreadyCheckedIn || downloadingId === passengerId
                    }
                    onClick={() => handleDownloadPdf(passengerId, fullName)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {downloadingId === passengerId ? "..." : "PDF"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
          {!alreadyCheckedIn && (
            <>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground text-center">
                Boarding passes will be available after you complete online
                check-in.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type Passenger = { firstName: string; lastName: string; seatId?: string };
