import React, { createContext, useContext, useSyncExternalStore } from "react";
import { AdminType, Type } from "../constants/theme";
import { getRole, subscribe } from "../services/authStore";

export type DensityName = "comfortable" | "compact";

const DENSITIES = {
  // Large text and 64 px controls, for patients.
  comfortable: { type: Type, control: 64 },
  // Smaller text and 48 px controls, for the admin panel.
  compact: { type: AdminType, control: 48 },
} as const;

const DensityContext = createContext<DensityName>("comfortable");

export function DensityProvider({
  density,
  children,
}: {
  density: DensityName;
  children: React.ReactNode;
}) {
  return <DensityContext.Provider value={density}>{children}</DensityContext.Provider>;
}

// Components read the type scale and control height from here instead of importing `Type`,
// so a `Screen` can switch a whole view between densities.
export const useDensity = () => DENSITIES[useContext(DensityContext)];

// Patients get the large scale; specialists and admins the compact one, in every view.
export function RoleDensity({ children }: { children: React.ReactNode }) {
  const role = useSyncExternalStore(subscribe, getRole, getRole);
  return (
    <DensityProvider density={role === "PATIENT" || role === null ? "comfortable" : "compact"}>
      {children}
    </DensityProvider>
  );
}
