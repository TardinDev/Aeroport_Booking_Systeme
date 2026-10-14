import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { useHoneypot } from "@/hooks/useHoneypot";
import { usePageMeta } from "@/hooks/usePageMeta";
import { openMailRequest } from "@/lib/contact";
import { RIDE_AMENITIES, VTC_VEHICLES, type VtcVehicle } from "@/lib/ride";
import { cn } from "@/lib/utils";

const STEPS = ["book", "confirm", "ride"] as const;
const FORM_ID = "vtc-request";
const MAX_PASSENGERS = 7;

export function VtcPage() {
  const { t } = useTranslation();
  const honeypot = useHoneypot();
  const [vehicle, setVehicle] = useState<VtcVehicle>("sedan");
  const today = new Date().toISOString().slice(0, 10);

  usePageMeta({
    title: t("meta.vtc.title"),
    description: t("meta.vtc.description"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (honeypot.isSpam()) return;
    const form = new FormData(e.currentTarget);
    const sent = openMailRequest(t("vtc.form.mailSubject"), [
      `${t("vtc.form.pickup")} : ${form.get("pickup")}`,
      `${t("vtc.form.dropoff")} : ${form.get("dropoff")}`,
      `${t("vtc.form.date")} : ${form.get("date")} ${form.get("time")}`,
      `${t("vtc.form.passengers")} : ${form.get("passengers")}`,
      `${t("vtc.form.vehicle")} : ${t(`vtc.vehicles.${vehicle}.name`)}`,
      "",
      `${t("vtc.form.email")} : ${form.get("email")}`,
    ]);
    if (sent) {
      toast.success(t("contact.sent"));
    } else {
      toast.error(t("contact.unavailable"));
    }
  };

  return (
    <>
      <section className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_30%,#e9f3ff_78%,#ffffff_100%)] pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <div className="content">
          <p className="text-[19px] font-semibold text-muted-foreground">
            {t("vtc.eyebrow")}
          </p>
          <h1 className="type-hero mt-3">{t("vtc.title")}</h1>
          <p className="type-lede mx-auto mt-5 max-w-[36ch]">
            {t("vtc.subtitle")}
          </p>
          <Button size="lg" className="mt-8" asChild>
            <a href={`#${FORM_ID}`}>{t("vtc.cta")}</a>
          </Button>
        </div>

        <img
          src="/chauffeur-car.webp"
          alt={t("home.journey.carAlt")}
          width={960}
          height={317}
          decoding="async"
          className="mx-auto mt-10 h-auto w-full max-w-[640px] px-6"
        />

        <div className="content mt-8">
          <p className="type-caption">{t("home.journey.during")}</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2.5">
            {RIDE_AMENITIES.map(({ key, icon: Icon, tone }) => (
              <li
                key={key}
                className="inline-flex h-10 items-center gap-2.5 rounded-full bg-background py-1 pl-1 pr-4 text-[15px] shadow-card"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    tone
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                {t(`home.journey.amenities.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-secondary">
        <div className="content-wide">
          <Reveal>
            <h2 className="type-headline text-center">
              {t("vtc.vehicles.title")}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {VTC_VEHICLES.map((id, i) => (
              <Reveal key={id} delay={i * 0.08} className="rounded-xl bg-card p-8">
                <h3 className="type-title">{t(`vtc.vehicles.${id}.name`)}</h3>
                <p className="type-body mt-2">{t(`vtc.vehicles.${id}.detail`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="content-wide">
          <Reveal>
            <h2 className="type-headline text-center">{t("vtc.steps.title")}</h2>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step}>
                <Reveal delay={i * 0.08} className="h-full rounded-xl bg-secondary p-8">
                  <p className="text-[28px] font-semibold leading-none text-link">
                    {i + 1}
                  </p>
                  <h3 className="type-title mt-5">{t(`vtc.steps.${step}.title`)}</h3>
                  <p className="type-body mt-2">{t(`vtc.steps.${step}.text`)}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id={FORM_ID} className="section scroll-mt-12 bg-secondary">
        <div className="content">
          <Reveal className="text-center">
            <h2 className="type-headline">{t("vtc.form.title")}</h2>
            <p className="type-lede mx-auto mt-4 max-w-[40ch]">
              {t("vtc.form.note")}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-10 max-w-[720px] rounded-3xl bg-card p-6 md:p-10"
            >
              <input {...honeypot.fieldProps} />

              <fieldset>
                <legend className="text-sm font-medium">
                  {t("vtc.form.vehicle")}
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {VTC_VEHICLES.map((id) => (
                    <label
                      key={id}
                      className={cn(
                        "cursor-pointer rounded-md border px-2 py-3 text-center text-[15px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                        vehicle === id
                          ? "border-link font-medium text-link ring-1 ring-link"
                          : "border-border hover:border-input"
                      )}
                    >
                      <input
                        type="radio"
                        name="vehicle"
                        value={id}
                        checked={vehicle === id}
                        onChange={() => setVehicle(id)}
                        className="sr-only"
                      />
                      {t(`vtc.vehicles.${id}.name`)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="vtc-pickup">{t("vtc.form.pickup")}</Label>
                  <Input
                    id="vtc-pickup"
                    name="pickup"
                    required
                    placeholder={t("vtc.form.pickupPlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vtc-dropoff">{t("vtc.form.dropoff")}</Label>
                  <Input
                    id="vtc-dropoff"
                    name="dropoff"
                    required
                    placeholder={t("vtc.form.dropoffPlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vtc-date">{t("vtc.form.date")}</Label>
                  <Input id="vtc-date" name="date" type="date" required min={today} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vtc-time">{t("vtc.form.time")}</Label>
                  <Input id="vtc-time" name="time" type="time" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vtc-passengers">{t("vtc.form.passengers")}</Label>
                  <Input
                    id="vtc-passengers"
                    name="passengers"
                    type="number"
                    required
                    min={1}
                    max={MAX_PASSENGERS}
                    defaultValue={1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vtc-email">{t("vtc.form.email")}</Label>
                  <Input
                    id="vtc-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t("lookup.emailPlaceholder")}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button type="submit" size="lg" className="w-full md:w-auto">
                  {t("vtc.form.submit")}
                </Button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
