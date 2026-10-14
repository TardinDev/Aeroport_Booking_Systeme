import { useRef, useState } from "react";

/** Humans rarely submit a form this fast; scripts usually do. */
const MIN_FILL_TIME_MS = 1500;

/**
 * Client-side spam filter for public forms: a field hidden from people
 * that bots tend to fill in, plus a minimum time before submitting.
 * It stops unsophisticated bots only; the API must still rate-limit.
 */
export function useHoneypot() {
  const [mountedAt] = useState(() => Date.now());
  const fieldRef = useRef<HTMLInputElement>(null);

  const isSpam = () =>
    Boolean(fieldRef.current?.value) ||
    Date.now() - mountedAt < MIN_FILL_TIME_MS;

  /** Spread onto a visually hidden <input>. */
  const fieldProps = {
    ref: fieldRef,
    type: "text",
    name: "website",
    tabIndex: -1,
    autoComplete: "off",
    "aria-hidden": true,
    className: "absolute left-[-9999px] h-px w-px opacity-0",
  } as const;

  return { isSpam, fieldProps };
}
