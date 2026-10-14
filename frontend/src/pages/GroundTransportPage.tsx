import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight, Eye, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { useHoneypot } from "@/hooks/useHoneypot";
import { ESCORT_TIERS } from "@/lib/escort";
import { usePageMeta } from "@/hooks/usePageMeta";
import { openMailRequest } from "@/lib/contact";
import { cn } from "@/lib/utils";

const PRINCIPLES = [
  {
    icon: Eye,
    title: "Reconnaissance préalable.",
    text: "La veille de votre arrivée, nos agents étudient le terminal et valident l'itinéraire. Quand vous descendez de l'avion, le chemin est déjà tracé.",
  },
  {
    icon: Shield,
    title: "Véhicule sécurisé.",
    text: "Berline aux vitres fumées, blindée sur demande, conduite par un chauffeur formé à la conduite défensive et garée au plus près de la sortie.",
  },
  {
    icon: Lock,
    title: "Discrétion absolue.",
    text: "Aucun nom prononcé en public, aucune pancarte. Vos déplacements, vos lieux et vos contacts restent dans votre dossier.",
  },
];

const STEPS = [
  {
    title: "Vous réservez",
    text: "Vous indiquez votre vol, votre terminal et votre destination finale.",
  },
  {
    title: "Nous préparons",
    text: "Votre agent repère l'aéroport, choisit la sortie et valide la voiture et son itinéraire.",
  },
  {
    title: "Vous êtes accueilli",
    text: "À la sortie de l'avion, votre agent vous attend. Vous n'avez qu'à le suivre.",
  },
  {
    title: "Vous arrivez",
    text: "Un trajet direct, au calme, jusqu'à votre porte.",
  },
];

const TIERS = [
  {
    grade: "Argent",
    price: "450 €",
    unit: "par heure",
    features: [
      "1 agent en tenue civile",
      "Berline noire, vitres fumées",
      "Reconnaissance 12 h avant",
      "Trajet direct, GPS chiffré",
    ],
  },
  {
    grade: "Diamant",
    price: "1 200 €",
    unit: "par heure",
    recommended: true,
    features: [
      "2 agents : chauffeur et escorte",
      "SUV à blindage léger (B6)",
      "Reconnaissance 24 h avant",
      "Itinéraires de repli préparés",
      "Communications chiffrées",
    ],
  },
  {
    grade: "Obsidienne",
    price: "Sur devis",
    unit: "",
    features: [
      "4 agents, équipe complète",
      "Convoi de 3 véhicules",
      "Blindage B7",
      "Coordination avec les autorités locales",
      "Médecin à bord sur demande",
      "Briefing personnalisé en amont",
    ],
  },
];

export function GroundTransportPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  // A visitor arriving from the home teaser has already chosen a level,
  // an airport and a date: open the request with those filled in.
  const requestedTier = ESCORT_TIERS.find(
    (tier) => tier.id === searchParams.get("level")
  );
  const prefilledDetails = requestedTier
    ? [
        `Niveau : ${requestedTier.grade}`,
        `Aéroport d'arrivée : ${searchParams.get("airport") ?? ""}`,
        `Date d'arrivée : ${searchParams.get("date") ?? ""}`,
      ].join("\n")
    : "";
  const [contactOpen, setContactOpen] = useState(Boolean(requestedTier));
  const honeypot = useHoneypot();

  usePageMeta({
    title: t("meta.transport.title"),
    description: t("meta.transport.description"),
  });

  // There is no escort endpoint yet, so the request goes out through the
  // visitor's own mail client rather than being silently dropped.
  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (honeypot.isSpam()) return;
    const form = new FormData(e.currentTarget);
    const sent = openMailRequest("Demande Service Escort", [
      String(form.get("details")),
      "",
      `Répondre à : ${form.get("email")}`,
    ]);
    if (!sent) {
      toast.error(t("contact.unavailable"));
      return;
    }
    toast.success(t("contact.sent"));
    setContactOpen(false);
  };

  return (
    <>
      <section className="bg-foreground pb-20 pt-20 text-center text-secondary md:pb-28 md:pt-28">
        <div className="content">
          <p className="text-[19px] font-semibold text-secondary/70">
            Service Escort
          </p>
          <h1 className="type-hero mt-3">Arrivez sans rien laisser au hasard.</h1>
          <p className="type-lede mx-auto mt-5 max-w-[38ch] text-secondary/70">
            Un agent vous accueille à la sortie de l'avion. La voiture attend.
            Aucune attente, aucun détour.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            <Button size="lg" onClick={() => setContactOpen(true)}>
              Réserver un agent
            </Button>
            <a
              href="#niveaux"
              className="inline-flex items-center gap-0.5 text-[17px] text-link-on-dark hover:underline"
            >
              Voir les niveaux
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="content-wide">
          <Reveal>
            <h2 className="type-headline text-center">
              Un agent. Une voiture. Aucun détour.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, text }, i) => (
              <Reveal
                key={title}
                delay={i * 0.08}
                className="rounded-xl bg-secondary p-8"
              >
                <Icon className="h-8 w-8" strokeWidth={1.5} />
                <h3 className="type-title mt-6">{title}</h3>
                <p className="type-body mt-2">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-secondary">
        <div className="content-wide">
          <Reveal className="text-center">
            <h2 className="type-headline">Quatre étapes. Aucun bruit.</h2>
            <p className="type-lede mx-auto mt-4 max-w-[40ch]">
              De la réservation jusqu'au moment où la portière se referme
              derrière vous.
            </p>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 0.08} className="h-full rounded-xl bg-card p-7">
                  <p className="text-[28px] font-semibold leading-none text-muted-foreground">
                    {i + 1}
                  </p>
                  <h3 className="mt-5 text-[19px] font-semibold leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-normal text-muted-foreground">
                    {step.text}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="niveaux" className="section scroll-mt-12 bg-background">
        <div className="content-wide">
          <Reveal>
            <h2 className="type-headline text-center">
              Trois niveaux de protection.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {TIERS.map((tier, i) => (
              <Reveal
                key={tier.grade}
                delay={i * 0.08}
                className={cn(
                  "flex flex-col rounded-xl bg-secondary p-8",
                  tier.recommended && "ring-2 ring-link"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="type-title">{tier.grade}</h3>
                  {tier.recommended && (
                    <span className="rounded-full bg-link px-2.5 py-0.5 text-xs font-medium text-white">
                      Recommandé
                    </span>
                  )}
                </div>
                <p className="mt-4">
                  <span className="text-[40px] font-semibold leading-none tracking-tight">
                    {tier.price}
                  </span>
                  {tier.unit && (
                    <span className="ml-2 text-[15px] text-muted-foreground">
                      {tier.unit}
                    </span>
                  )}
                </p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6 text-[15px] leading-snug">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.recommended ? "default" : "outline"}
                  className="mt-8 w-full"
                  onClick={() => setContactOpen(true)}
                >
                  Demander {tier.grade}
                </Button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-secondary">
        <Reveal className="content text-center">
          <h2 className="type-headline">Vous nous écrivez. Nous arrivons.</h2>
          <p className="type-lede mx-auto mt-4 max-w-[40ch]">
            Chaque demande est traitée par un agent, jamais par une réponse
            automatique.
          </p>
          <Button size="lg" className="mt-8" onClick={() => setContactOpen(true)}>
            Faire une demande
          </Button>
        </Reveal>
      </section>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="gap-2 text-left">
            <DialogTitle className="type-title">Votre demande.</DialogTitle>
            <DialogDescription className="text-[15px]">
              Indiquez votre vol, votre destination et la date. Un agent vous
              répond par e-mail.
            </DialogDescription>
          </DialogHeader>
          <form className="mt-2 grid gap-4" onSubmit={handleContactSubmit}>
            <input {...honeypot.fieldProps} />
            <div className="grid gap-2">
              <Label htmlFor="escort-email">Adresse e-mail</Label>
              <Input
                id="escort-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@exemple.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="escort-details">Votre voyage</Label>
              <textarea
                id="escort-details"
                name="details"
                defaultValue={prefilledDetails}
                rows={4}
                required
                placeholder="Vol, terminal, destination finale, date"
                className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-[17px] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
              />
            </div>
            <Button type="submit" className="mt-2 w-full">
              Envoyer la demande
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
