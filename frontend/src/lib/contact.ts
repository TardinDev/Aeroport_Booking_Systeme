import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Hands a request to the visitor's own mail client, addressed to the site.
 * There is no request endpoint yet, so this is how forms reach a human.
 * Returns false when no contact address is configured.
 */
export function openMailRequest(subject: string, lines: string[]): boolean {
  if (!CONTACT_EMAIL) return false;
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?${query}`;
  return true;
}
