import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("meta.notFound.title"), noindex: true });

  return (
    <section className="content flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center py-20 text-center">
      <p className="type-caption">404</p>
      <h1 className="type-headline mt-3">{t("notFound.title")}</h1>
      <p className="type-lede mt-4">{t("notFound.subtitle")}</p>
      <Button size="lg" className="mt-8" asChild>
        <Link to="/">{t("notFound.backHome")}</Link>
      </Button>
    </section>
  );
}
