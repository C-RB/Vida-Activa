// Web version of the active exercise screen: VisionCamera only works on devices and fails on import in
// the browser, so Metro uses this file instead of ActiveExerciseScreen.tsx on web.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import { Colors, Radius, Type } from "../../constants/theme";
import { useAppFonts } from "../../hooks/useAppFonts";

export default function ActiveExerciseScreenWeb() {
  const router = useRouter();
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[Type.title2, styles.title]}>
          Este ejercicio solo se puede hacer en el celular
        </Text>
        <Text style={[Type.body, styles.text]}>
          La detección de postura usa la cámara del teléfono. Abra la app en su
          celular para hacer la sesión.
        </Text>
        <Button
          title="Volver al inicio"
          onPress={() => router.replace("/patient-home" as any)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    gap: 16,
    padding: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
  },
  title: {
    color: Colors.textPrimary,
  },
  text: {
    color: Colors.textSecondary,
  },
});
