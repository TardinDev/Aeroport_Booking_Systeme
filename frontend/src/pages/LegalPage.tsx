import { useTranslation } from "react-i18next";

import {
  getLegalDocument,
  LEGAL_UPDATED_AT,
  type LegalDocumentId,
} from "@/content/legal";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CONTACT_EMAIL } from "@/lib/site";

interface LegalPageProps {
  document: LegalDocumentId;
}

export function LegalPage({ document }: LegalPageProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const doc = getLegalDocument(document, language);
  const updatedAt = new Intl.DateTimeFormat(language, { dateStyle: "long" }).format(
    new Date(LEGAL_UPDATED_AT)
  );

  usePageMeta({ title: doc.title, description: doc.intro });

  return (
    <article
      lang={language.startsWith("fr") ? "fr" : "en"}
      className="mx-auto max-w-[692px] px-[22px] py-16 md:py-24"
    >
      <h1 className="type-headline">{doc.title}</h1>
      <p className="type-caption mt-4">
        {t("legal.updated", { date: updatedAt })}
      </p>
      <p className="type-lede mt-8">{doc.intro}</p>

      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-12">
          <h2 className="type-title">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="type-body mt-4">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      {CONTACT_EMAIL && (
        <p className="mt-12 border-t border-border pt-8">
          {doc.contact}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}
    </article>
  );
}
