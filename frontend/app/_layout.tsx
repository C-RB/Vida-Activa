import { useEffect } from "react";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAppFonts } from "../hooks/useAppFonts";
import { RoleDensity } from "../hooks/useDensity";

SplashScreen.preventAutoHideAsync();

// Fonts load once here, so no screen or component has to wait for them.
export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <RoleDensity>
      <Slot />
    </RoleDensity>
  );
}
