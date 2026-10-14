import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";

interface BookingLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Public-friendly booking lookup.
 *
 * If the user is authenticated, sends them straight to /dashboard.
 * Otherwise, prompts for a booking reference + email so they can retrieve
 * their itinerary without creating an account.
 *
 * Backend Phase 1 has no public lookup endpoint — submitting routes the
 * guest to /login with a return target. The reference is stashed in
 * sessionStorage so the dashboard can pre-filter once they log in.
 */
export function BookingLookupDialog({
  open,
  onOpenChange,
}: BookingLookupDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");

  const goTo = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem(
      "pendingBookingLookup",
      JSON.stringify({ reference: reference.trim(), email: email.trim() }),
    );
    goTo("/login?redirect=/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="gap-2 text-left">
          <DialogTitle className="type-title">{t("lookup.title")}</DialogTitle>
          <DialogDescription className="text-[15px]">
            {isAuthenticated ? t("lookup.auth") : t("lookup.guest")}
          </DialogDescription>
        </DialogHeader>

        {isAuthenticated ? (
          <Button className="mt-2 w-full" onClick={() => goTo("/dashboard")}>
            {t("lookup.viewBookings")}
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="booking-ref">{t("lookup.reference")}</Label>
              <Input
                id="booking-ref"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="SKB-2026-0000"
                autoCapitalize="characters"
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="booking-email">{t("lookup.email")}</Label>
              <Input
                id="booking-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("lookup.emailPlaceholder")}
                autoComplete="email"
              />
            </div>

            <Button type="submit" className="mt-2 w-full">
              {t("lookup.submit")}
            </Button>

            <button
              type="button"
              onClick={() => goTo("/login?redirect=/dashboard")}
              className="text-center text-[15px] text-link hover:underline"
            >
              {t("lookup.orLogin")}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
