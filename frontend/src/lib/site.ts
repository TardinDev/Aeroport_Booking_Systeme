/** Site-wide facts that depend on where the app is deployed. */
export const SITE_NAME = "Fly & taxi";

/** Public origin, without trailing slash. Empty in local development. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/$/, "");

/** Address shown on the legal pages and used by the contact forms. */
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? "";
