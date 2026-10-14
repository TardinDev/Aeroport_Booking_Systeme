import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useConsentStore } from "@/stores/useConsentStore";

export function Footer() {
  const { t } = useTranslation();
  const resetConsent = useConsentStore((s) => s.reset);
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: t("footer.travel.title"),
      links: [
        { to: "/flights", label: t("footer.travel.flights") },
        { to: "/transport", label: t("footer.travel.transfers") },
        { to: "/dashboard", label: t("footer.travel.bookings") },
      ],
    },
    {
      title: t("footer.account.title"),
      links: [
        { to: "/login", label: t("footer.account.login") },
        { to: "/register", label: t("footer.account.register") },
      ],
    },
    {
      title: t("legal.title"),
      links: [
        { to: "/privacy", label: t("legal.privacy") },
        { to: "/terms", label: t("legal.terms") },
        { to: "/cookies", label: t("legal.cookies") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-secondary text-[12px] leading-[1.35] text-muted-foreground">
      <div className="content-wide py-10">
        <div className="grid grid-cols-2 gap-8 border-b border-border pb-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="text-[17px] font-semibold tracking-tight text-foreground">
              Fly &amp; taxi
            </Link>
            <p className="mt-2 max-w-[36ch]">{t("footer.tagline")}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="font-semibold text-foreground">{column.title}</p>
              <ul className="mt-3 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-foreground hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-5">
          <p>
            © {currentYear} {t("footer.copyright")}
          </p>
          <button
            type="button"
            onClick={resetConsent}
            className="hover:text-foreground hover:underline"
          >
            {t("cookies.manage")}
          </button>
        </div>
      </div>
    </footer>
  );
}
