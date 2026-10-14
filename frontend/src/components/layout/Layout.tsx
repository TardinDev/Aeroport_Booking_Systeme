import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LanguagePicker } from "@/components/layout/LanguagePicker";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@/components/shared/Analytics";
import { cn } from "@/lib/utils";

// Marketing pages paint their own section backgrounds; every other
// page sits on the grey surface so its white cards stand out.
const FULL_BLEED_ROUTES = ["/", "/vtc", "/transport", "/404", "/privacy", "/terms", "/cookies"];

export function Layout() {
  const { pathname } = useLocation();
  const fullBleed = FULL_BLEED_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn("flex-1", !fullBleed && "bg-secondary")}>
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <LanguagePicker />
      <CookieBanner />
      <Analytics />
    </div>
  );
}
