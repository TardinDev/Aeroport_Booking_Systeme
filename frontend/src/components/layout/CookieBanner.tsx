import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useConsentStore } from "@/stores/useConsentStore";

/**
 * Asks once for consent to audience measurement. Refusing is as easy as
 * accepting, and the choice can be changed from the footer.
 */
export function CookieBanner() {
  const { t } = useTranslation();
  const analytics = useConsentStore((s) => s.analytics);
  const setAnalytics = useConsentStore((s) => s.setAnalytics);

  if (analytics !== null) return null;

  return (
    <section
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[560px] rounded-2xl bg-background/90 p-6 shadow-modal backdrop-blur-xl"
    >
      <h2 id="cookie-banner-title" className="text-[17px] font-semibold">
        {t("cookies.title")}
      </h2>
      <p className="mt-1.5 text-[15px] leading-normal text-muted-foreground">
        {t("cookies.text")}{" "}
        <Link to="/cookies" className="text-link hover:underline">
          {t("cookies.learnMore")}
        </Link>
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => setAnalytics(false)}>
          {t("cookies.refuse")}
        </Button>
        <Button variant="secondary" onClick={() => setAnalytics(true)}>
          {t("cookies.accept")}
        </Button>
      </div>
    </section>
  );
}
