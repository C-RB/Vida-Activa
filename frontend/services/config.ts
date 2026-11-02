import { Platform } from "react-native";

// Backend base URL. Override with EXPO_PUBLIC_API_URL (use the LAN IP on a physical device).
// Defaults: 10.0.2.2 on the Android emulator, localhost on the iOS simulator and web.
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_HOST}:8000`;
