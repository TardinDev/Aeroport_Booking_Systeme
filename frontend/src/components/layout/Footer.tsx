import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plane, Globe, ExternalLink, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Fly &amp; Taxi</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.aboutText")}
            </p>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.links.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/flights"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.links.flights")}
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.links.services")}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.links.faq")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.links.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.legal.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.legal.cookies")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.social.title")}</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
