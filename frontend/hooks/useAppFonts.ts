import { useFonts } from "expo-font";

// Loads the four Inter weights of the v2 style guide (see Fonts in constants/theme).
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    InterRegular: require("../assets/fonts/Inter_400Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter_500Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter_700Bold.ttf"),
  });
  return loaded;
}
