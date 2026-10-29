import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { routes } from "../router/routes";

import { Colors } from "../constants/theme";
type Active = "home" | "history" | "profile";

type Props = {
  active: Active;
};

export default function PatientNavbar({ active }: Props) {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    InterRegular: require("../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  const colorFor = (key: Active) =>
    active === key ? Colors.primary : "rgba(23, 32, 51, 0.45)";

  const fontFor = (key: Active) =>
    active === key ? "InterSemiBold" : "InterRegular";

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/patient-home" as any)}
      >
        <MaterialCommunityIcons name="home-outline" size={34} color={colorFor("home")} />
        <Text style={[styles.label, { color: colorFor("home"), fontFamily: fontFor("home") }]}>
          Inicio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(routes.patientHistory as any)}
      >
        <MaterialCommunityIcons
          name="chart-timeline-variant"
          size={34}
          color={colorFor("history")}
        />
        <Text style={[styles.label, { color: colorFor("history"), fontFamily: fontFor("history") }]}>
          Historial
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/patient-profile" as any)}
      >
        <MaterialCommunityIcons
          name="account-outline"
          size={34}
          color={colorFor("profile")}
        />
        <Text style={[styles.label, { color: colorFor("profile"), fontFamily: fontFor("profile") }]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 86,
    backgroundColor: "transparent",
    paddingTop: 4,
    paddingBottom: Platform.OS === "ios" ? 12 : 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 4,
  },
});
