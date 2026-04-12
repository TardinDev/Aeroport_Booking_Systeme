import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PaymentMethodsProps {
  className?: string;
  /** Compact = small inline strip; Editorial = full hero panel. */
  variant?: "editorial" | "compact";
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
 * PaymentMethods — an editorial strip listing every payment method
 * Fly & Taxi accepts. Each tile is a bordered card with the real
 * brand logo centred inside, and the full name in small-caps
 * underneath. If a logo fails to load the card gracefully falls
 * back to the typographic short-code so nothing ever looks broken.
 */
export function PaymentMethods({
  className,
  variant = "editorial",
}: PaymentMethodsProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {METHODS.map((m) => (
          <CompactTile key={m.code} method={m} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {METHODS.map((m, i) => (
          <motion.div
            key={m.code}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            viewport={{ once: true, margin: "-10%" }}
            className="group flex aspect-[3/2] flex-col items-center justify-center gap-1 border-2 border-ink bg-paper p-3 shadow-[3px_3px_0_0_var(--ink)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_var(--coral)]"
          >
            <EditorialTile method={m} />
            <span className="small-caps text-[0.55rem] text-ink-faded">
              {m.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Tile body — tries to render the real brand logo as an <img>.
 * If the image fails to load we swap in the typographic short-code
 * in the same editorial style as the original component.
 */
function EditorialTile({ method }: { method: PaymentMethod }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="display-serif text-2xl text-ink group-hover:text-coral">
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
      className="h-8 max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-[1.04] sm:h-9"
    />
  );
}

function CompactTile({ method }: { method: PaymentMethod }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        title={method.label}
        className="inline-flex items-center justify-center border border-ink/60 bg-paper px-2 py-0.5 font-mono text-[0.55rem] tracking-wider text-ink"
      >
        {method.short}
      </span>
    );
  }

  return (
    <span
      title={method.label}
      className="inline-flex h-6 w-10 items-center justify-center border border-ink/60 bg-paper px-1"
    >
      <img
        src={method.logo}
        alt={method.label}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="max-h-4 max-w-full object-contain"
      />
    </span>
  );
}
