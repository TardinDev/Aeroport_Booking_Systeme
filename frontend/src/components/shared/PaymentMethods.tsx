import { useState } from "react";
import { cn } from "@/lib/utils";

interface PaymentMethodsProps {
  className?: string;
  /** Compact = small inline strip; grid = one tile per method. */
  variant?: "grid" | "compact";
}

interface PaymentMethod {
  code: string;
  label: string;
  /** Typographic fallback rendered if the real logo fails to load. */
  short: string;
  /** URL to an SVG/PNG of the real brand mark. */
  logo: string;
}

/**
 * Real brand marks sourced from Wikimedia Commons (stable, long-lived URLs)
 * plus jsdelivr for Alipay. Each entry falls back to `short` if the image
 * can't be loaded at runtime, so the strip never looks broken.
 */
const METHODS: PaymentMethod[] = [
  {
    code: "VISA",
    label: "Visa",
    short: "VISA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg",
  },
  {
    code: "MC",
    label: "Mastercard",
    short: "MC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  },
  {
    code: "AMEX",
    label: "American Express",
    short: "AMEX",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg",
  },
  {
    code: "PAYPAL",
    label: "PayPal",
    short: "PP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
  },
  {
    code: "APPLE",
    label: "Apple Pay",
    short: "Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg",
  },
  {
    code: "GOOGLE",
    label: "Google Pay",
    short: "G·Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
  },
  {
    code: "ALIPAY",
    label: "Alipay",
    short: "支付",
    logo: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/alipay.svg",
  },
  {
    code: "WECHAT",
    label: "WeChat Pay",
    short: "微信",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/af/WeChat_logo.svg",
  },
  {
    code: "UNIONPAY",
    label: "UnionPay",
    short: "银联",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg",
  },
  {
    code: "SEPA",
    label: "SEPA",
    short: "SEPA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Single_Euro_Payments_Area_logo.svg",
  },
  {
    code: "KLARNA",
    label: "Klarna",
    short: "K.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/40/Klarna_Payment_Badge.svg",
  },
  {
    code: "MPESA",
    label: "M-Pesa",
    short: "M·P",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg",
  },
];

/**
 * PaymentMethods — lists every payment method Fly & taxi accepts,
 * one brand logo per tile. If a logo fails to load the tile falls
 * back to the typographic short-code so nothing ever looks broken.
 */
export function PaymentMethods({
  className,
  variant = "grid",
}: PaymentMethodsProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {METHODS.map((m) => (
          <span
            key={m.code}
            title={m.label}
            className="inline-flex h-7 w-11 items-center justify-center rounded-[6px] bg-secondary px-1.5"
          >
            <Logo method={m} className="max-h-4 max-w-full" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6",
        className
      )}
    >
      {METHODS.map((m) => (
        <li
          key={m.code}
          className="flex aspect-[3/2] items-center justify-center rounded-xl bg-secondary p-4"
        >
          <Logo method={m} className="h-7 max-w-[80%] sm:h-8" />
        </li>
      ))}
    </ul>
  );
}

function Logo({
  method,
  className,
}: {
  method: PaymentMethod;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-[13px] font-semibold text-muted-foreground">
        {method.short}
      </span>
    );
  }

  return (
    <img
      src={method.logo}
      alt={method.label}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-contain", className)}
    />
  );
}
