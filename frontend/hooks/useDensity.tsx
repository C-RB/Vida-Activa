import React, { createContext, useContext } from "react";
import { AdminType, Type } from "../constants/theme";

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
