import { useEffect } from "react";

import { SITE_NAME, SITE_URL } from "@/lib/site";

interface PageMeta {
  title: string;
  description?: string;
  /** Keep private or transactional pages out of search results. */
  noindex?: boolean;
}

function setMeta(name: string, content: string | null) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (content === null) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

/** Sets the document title, description, canonical URL and robots directive. */
export function usePageMeta({ title, description, noindex = false }: PageMeta) {
  useEffect(() => {
    document.title = `${title} · ${SITE_NAME}`;
    if (description) setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : null);
    setCanonical(`${SITE_URL || window.location.origin}${window.location.pathname}`);
  }, [title, description, noindex]);
}
