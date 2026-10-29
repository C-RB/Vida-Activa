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
import { router, useRouter } from "expo-router";
import SpecialistNavbar from "../../components/SpecialistNavbar";
import { getPatients, PatientListItem } from "../../services/patientService";
import { routes } from "../../router/routes";

import { Colors, GradientColors } from "../../constants/theme";

function PatientCard({
  patient,
  onViewInfo,
  onAssignRoutine,
}: {
  patient: PatientListItem;
  onViewInfo: (id: string) => void;
  onAssignRoutine: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatarWrap}>
          <MaterialCommunityIcons
            name="account-outline"
            size={24}
            color={Colors.primary}
          />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{patient.fullName}</Text>
          {(patient.age != null || patient.lastActivity) && (
            <Text style={styles.cardMeta}>
              {[
                patient.age != null ? `${patient.age} años` : null,
                patient.lastActivity,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
        </View>

        {patient.hasAlert && (
          <View style={styles.alertBadge}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={13}
              color={Colors.warning}
            />
            <Text style={styles.alertBadgeText}>Alerta</Text>
          </View>
        )}
      </View>

      {patient.alertMessage && (
        <Text style={styles.alertMessage}>{patient.alertMessage}</Text>
      )}

      <View style={styles.cardDivider} />

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.btnInfo}
          onPress={() => onViewInfo(patient.id)}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name="account-details-outline"
            size={15}
            color={Colors.primary}
          />
          <Text style={styles.btnInfoText}>Ver información</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnRoutine}
          onPress={() => onAssignRoutine(patient.id)}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name="clipboard-list-outline"
            size={15}
            color={Colors.textPrimary}
          />
          <Text style={styles.btnRoutineText}>Asignar rutina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
          <Text style={styles.emptyText}>No se encontraron pacientes.</Text>
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

      <SpecialistNavbar active="patients" />
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

  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
    marginTop: 2,
  },

  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warningSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    marginLeft: 8,
  },
  alertBadgeText: {
    fontSize: 11,
    fontFamily: "InterSemiBold",
    color: Colors.warning,
  },

  alertMessage: {
    fontSize: 11,
    fontFamily: "InterRegular",
    color: Colors.warning,
    marginTop: 8,
    marginLeft: 54,
  },

  cardDivider: {
    height: 1,
    backgroundColor: Colors.primary,
    marginVertical: 12,
  },

  cardActions: {
    flexDirection: "row",
    gap: 10,
  },

  btnInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 9,
    backgroundColor: Colors.background,
  },
  btnInfoText: {
    fontSize: 12,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },

  btnRoutine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 9,
  },
  btnRoutineText: {
    fontSize: 12,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
    marginTop: 40,
  },
});