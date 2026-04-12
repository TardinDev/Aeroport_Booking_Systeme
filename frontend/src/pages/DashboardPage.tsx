import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Plane, Calendar, CreditCard, PlaneTakeoff,
  ClipboardCheck, UserCog, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { bookingsApi } from "@/api/bookings.api";

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => bookingsApi.getBookings(0, 10),
  });

  const bookings = bookingsData?.content ?? [];
  const upcomingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.flight.departureTime) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || new Date(b.flight.departureTime) <= new Date()
  );
  const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold">{t("dashboard.welcome", { name: user?.firstName ?? "" })}</h1>
        <p className="text-muted-foreground">{t("dashboard.title")}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Plane, label: t("dashboard.overview.upcomingFlights"), value: upcomingBookings.length, color: "blue" },
          { icon: Calendar, label: t("dashboard.overview.pastBookings"), value: pastBookings.length, color: "green" },
          { icon: CreditCard, label: t("dashboard.overview.totalSpent"), value: formatCurrency(totalSpent), color: "purple" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${card.color}-100 dark:bg-${card.color}-900`}>
                    <card.icon className={`h-6 w-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><CardTitle>{t("dashboard.upcoming.title")}</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <PlaneTakeoff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("dashboard.upcoming.noFlights")}</p>
                  <Button variant="link" onClick={() => navigate("/")}>{t("dashboard.upcoming.bookNow")}</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <motion.div key={booking.id} whileHover={{ x: 4 }} className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/booking/${booking.flight.id}`)}>
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Plane className="h-5 w-5 text-primary" /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{booking.flight.originCode}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.flight.destinationCode}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatDate(booking.flight.departureTime)} - {formatTime(booking.flight.departureTime)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === "CONFIRMED" ? "success" : "secondary"}>{t(`booking.status.${booking.status}`)}</Badge>
                        <p className="text-sm font-medium mt-1">{booking.bookingReference}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("dashboard.recent.title")}</CardTitle>
              <Button variant="link" size="sm">{t("dashboard.recent.viewAll")}</Button>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t("dashboard.recent.noBookings")}</p>
              ) : (
                <div className="space-y-2">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{booking.bookingReference}</span>
                        <span className="text-sm text-muted-foreground">{booking.flight.originCode} - {booking.flight.destinationCode}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{formatCurrency(booking.totalPrice, booking.currency)}</span>
                        <Badge variant="outline">{t(`booking.status.${booking.status}`)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader><CardTitle>{t("dashboard.quickActions.title")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/")}>
                <PlaneTakeoff className="mr-3 h-4 w-4" />{t("dashboard.quickActions.newBooking")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ClipboardCheck className="mr-3 h-4 w-4" />{t("dashboard.quickActions.checkIn")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCog className="mr-3 h-4 w-4" />{t("dashboard.quickActions.manageProfile")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
