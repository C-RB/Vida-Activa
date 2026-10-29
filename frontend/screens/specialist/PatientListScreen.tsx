import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import BottomNav from "../../components/layout/BottomNav";
import { getPatients, PatientListItem } from "../../services/patientService";
import { routes } from "../../router/routes";

import { Colors, GradientColors } from "../../constants/theme";
import PatientCard from "../../components/specialist/PatientCard";
import StateMessage from "../../components/ui/StateMessage";

export default function PatientListScreen({
  navigation,
}: {
  navigation?: any;
}) {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch((err) => Alert.alert("Error", err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) =>
    p.fullName.toLowerCase().includes(query.toLowerCase())
  );

  const handleViewInfo = (id: string) => {
    router.push({ pathname: routes.medicalRecord as any, params: { patientId: id } });
  };

  const handleAssignRoutine = (id: string) => {
    router.push({ pathname: routes.routineList as any, params: { patientId: id } });
  };

  const handleAddPatient = () => {
    router.push(routes.registerPatient as any);
  };

  if (!fontsLoaded || loading) {
    return (
      <LinearGradient colors={GradientColors as any} style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerSubtitle}>Panel Profesional</Text>
            <Text style={styles.bannerTitle}>Mis pacientes</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPatient}>
            <MaterialCommunityIcons name="plus" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={Colors.textPrimary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar Pacientes..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {filtered.length === 0 ? (
          <StateMessage empty="No se encontraron pacientes." />
        ) : (
          filtered.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              onViewInfo={handleViewInfo}
              onAssignRoutine={handleAssignRoutine}
            />
          ))
        )}
      </ScrollView>

      <BottomNav role="specialist" active="patients" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  banner: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.onPrimary,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderColor: Colors.primary,
    borderWidth: 1,
    backgroundColor: Colors.background,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
    padding: 0,
  },








});