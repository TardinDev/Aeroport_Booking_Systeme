import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConsentState {
  /** null until the visitor has answered the banner. */
  analytics: boolean | null;
  /** ISO date of the answer, so consent can be re-asked after it expires. */
  decidedAt: string | null;
}

interface ConsentActions {
  setAnalytics: (granted: boolean) => void;
  reset: () => void;
}

/** CNIL guidance: ask again after six months. */
const CONSENT_LIFETIME_MS = 1000 * 60 * 60 * 24 * 182;

export const useConsentStore = create<ConsentState & ConsentActions>()(
  persist(
    (set) => ({
      analytics: null,
      decidedAt: null,
      setAnalytics: (granted) =>
        set({ analytics: granted, decidedAt: new Date().toISOString() }),
      reset: () => set({ analytics: null, decidedAt: null }),
    }),
    {
      name: "fly-and-taxi-consent",
      merge: (persisted, current) => {
        const saved = persisted as Partial<ConsentState> | undefined;
        const expired =
          !saved?.decidedAt ||
          Date.now() - new Date(saved.decidedAt).getTime() > CONSENT_LIFETIME_MS;
        return expired ? current : { ...current, ...saved };
      },
    }
  )
);
