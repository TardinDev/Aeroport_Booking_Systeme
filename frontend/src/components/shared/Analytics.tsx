import { useEffect } from "react";

import { useConsentStore } from "@/stores/useConsentStore";

const SCRIPT_ID = "vercel-analytics";

/**
 * Loads Vercel Web Analytics, and only once the visitor has accepted
 * audience measurement. The script is served by the Vercel deployment
 * itself, so nothing is requested in development or on other hosts.
 */
export function Analytics() {
  const granted = useConsentStore((s) => s.analytics === true);

  useEffect(() => {
    if (!granted || !import.meta.env.PROD) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "/_vercel/insights/script.js";
    script.defer = true;
    document.head.appendChild(script);
  }, [granted]);

  return null;
}
