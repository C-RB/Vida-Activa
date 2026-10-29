import { useFonts } from "expo-font";

// Carga las 4 variantes de Inter de la guía v2 (ver Fonts en constants/theme).
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    InterRegular: require("../assets/fonts/Inter_400Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter_500Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter_700Bold.ttf"),
  });
  return loaded;
}
