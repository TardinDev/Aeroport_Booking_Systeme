import {
  BatteryCharging,
  GlassWater,
  Laptop,
  Music,
  Wifi,
} from "lucide-react";

/** What a ride offers on board. Labels live under `home.journey.amenities`. */
export const RIDE_AMENITIES = [
  { key: "wifi", icon: Wifi, tone: "bg-sky/10 text-sky" },
  { key: "charge", icon: BatteryCharging, tone: "bg-mint/10 text-mint" },
  { key: "water", icon: GlassWater, tone: "bg-aqua/10 text-aqua" },
  { key: "work", icon: Laptop, tone: "bg-grape/10 text-grape" },
  { key: "music", icon: Music, tone: "bg-rose/10 text-rose" },
] as const;

/** Vehicle classes of the chauffeur service. Labels live under `vtc.vehicles`. */
export const VTC_VEHICLES = ["sedan", "van", "premium"] as const;

export type VtcVehicle = (typeof VTC_VEHICLES)[number];
