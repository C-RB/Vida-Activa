import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import BottomNav from "../../components/layout/BottomNav";
import { routes } from "../../router/routes";
import { Colors, GradientColors, BannerStyle } from "../../constants/theme";
import {
  getPatientById,
  togglePatientStatus,
  Patient,
} from "../../services/patientService";
import InfoRow from "../../components/ui/InfoRow";
import ProgressRow from "../../components/ui/ProgressRow";
import SessionCard from "../../components/session/SessionCard";
import SectionTitle from "../../components/ui/SectionTitle";

export default function MedicalRecordScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  useEffect(() => {
    if (!patientId) {
      Alert.alert("Error", "No se indicó el paciente.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getPatientById(patientId)
      .then(setPatient)
      .catch((err) => Alert.alert("Error", err.message))
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleToggleStatus = () => {
    if (!patient) return;
    const next = !patient.active;
    const label = next ? "habilitar" : "deshabilitar";
    Alert.alert("Confirmar", `¿Desea ${label} a este paciente?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: () =>
          togglePatientStatus(patient.id, next)
            .then(setPatient)
            .catch((err) => Alert.alert("Error", err.message)),
      },
    ]);
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!patient) return null;

  const { metrics, sessions } = patient;

  return (
    <LinearGradient colors={GradientColors as unknown as [string, string]} style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Ficha Medica Paciente</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.card}>
          <View style={styles.patientRow}>
            <View style={styles.avatarWrap}>
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={48}
                color={Colors.primary}
              />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.fullName}</Text>
              <Text style={styles.patientRut}>{patient.rut}</Text>
              <View style={styles.patientMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Edad</Text>
                  <Text style={styles.metaVal}>{patient.age} años</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Genero</Text>
                  <Text style={styles.metaVal}>{patient.gender}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionLabel}>
          <SectionTitle>Información de Contacto</SectionTitle>
        </View>
        <View style={styles.card}>
          <InfoRow mdi="email-outline" value={patient.email} />
          <InfoRow mdi="phone-outline" value={patient.phone} />
          <InfoRow mdi="map-marker-outline" value={patient.address} />
        </View>

        <TouchableOpacity
          style={styles.agendarBtn}
          onPress={() =>
            router.push({
              pathname: routes.scheduleAppointment as any,
              params: { patientId: patient.id },
            })
          }
        >
          <Text style={styles.agendarText}>Agendar Hora</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.metricsHeader}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.metricsTitle}>Métricas de Cumplimiento</Text>
          </View>
          <Text style={styles.bigNumber}>{metrics.sessionsCompleted}</Text>
          <Text style={styles.bigNumberSub}>/ {metrics.sessionsTotal}</Text>
          <Text style={styles.metricsSubLabel}>
            Sesiones completadas esta semana
          </Text>
          <ProgressRow
            label={`${metrics.adherencePercent}% Adherencia`}
            progress={metrics.adherencePercent}
          />
        </View>

        <View style={styles.sectionLabel}>
          <SectionTitle>Historial de Sesiones</SectionTitle>
        </View>
        <View style={styles.card}>
          {sessions.map((s, i) => (
            <React.Fragment key={s.id}>
              <SessionCard session={s} />
              {i < sessions.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.disableBtn, !patient.active && styles.enableBtn]}
          onPress={handleToggleStatus}
        >
          <Text style={styles.disableBtnText}>
            {patient.active ? "Deshabilitar" : "Habilitar"}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: Colors.cardBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  banner: {
    ...BannerStyle,
  },
  bannerTitle: {
    fontSize: 22,
    fontFamily: "InterSemiBold",
    color: Colors.bannerTitle,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    marginTop: 12,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginBottom: 6,
    marginTop: 2,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    backgroundColor: Colors.cardBgAlt,
    borderRadius: 50,
    padding: 6,
    marginRight: 14,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  patientRut: {
    fontSize: 13,
    fontFamily: "InterRegular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  patientMeta: {
    flexDirection: "row",
    marginTop: 8,
    gap: 20,
  },
  metaItem: {},
  metaKey: {
    fontSize: 11,
    fontFamily: "InterRegular",
    color: Colors.textMuted,
  },
  metaVal: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  agendarBtn: {
    backgroundColor: Colors.btnPrimary,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  agendarText: {
    fontSize: 15,
    fontFamily: "InterSemiBold",
    color: Colors.bannerTitle,
  },
  metricsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  metricsTitle: {
    fontSize: 15,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  bigNumber: {
    fontSize: 48,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    lineHeight: 54,
  },
  bigNumberSub: {
    fontSize: 18,
    fontFamily: "InterRegular",
    color: Colors.textMuted,
    marginTop: -4,
  },
  metricsSubLabel: {
    fontSize: 13,
    fontFamily: "InterRegular",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBgAlt,
  },
  disableBtn: {
    backgroundColor: Colors.btnDanger,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  enableBtn: {
    backgroundColor: Colors.btnTeal,
  },
  disableBtnText: {
    fontSize: 15,
    fontFamily: "InterSemiBold",
    color: Colors.bannerTitle,
  },
});