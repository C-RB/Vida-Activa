import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import BottomNav from "../../components/layout/BottomNav";
import { getDashboard, DashboardResponse } from "../../services/specialistService";

import { Colors, GradientColors } from "../../constants/theme";
import StatCard from "../../components/ui/StatCard";
import ProgressRow from "../../components/ui/ProgressRow";
// "—" when there is no real data (loading or network error).
const fmt = (n: number | null | undefined) => (n != null ? `${n}` : "—");

export default function SpecialistHomeScreen() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  useEffect(() => {
    getDashboard()
      .then(setDashboardData)
      .catch((e) => console.error("Error cargando dashboard:", e))
      .finally(() => setLoading(false));
  }, []);

  if (!fontsLoaded) return null;

  const stats = dashboardData?.stats;
  const progress = dashboardData?.progress;

  // Progress bars in [0,100] for the fill width; "—" when there is no data.
  const sessionsValue =
    progress != null
      ? `${progress.sessions_completed_today}/${progress.sessions_total_today}`
      : "—";
  const sessionsProgress =
    progress != null && progress.sessions_total_today > 0
      ? (progress.sessions_completed_today / progress.sessions_total_today) * 100
      : 0;
  const compliance = progress?.daily_compliance;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Dashboard de Resumen</Text>
        <Text style={styles.bannerSubtitle}>
          {dashboardData
            ? `Hola, ${dashboardData.specialist.full_name}`
            : "Estado general de su red de atención para hoy."}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            <StatCard
              mdi="account-group-outline"
              value={fmt(stats?.total_patients)}
              label="Pacientes"
            />
            <StatCard
              mdi="run-fast"
              value={fmt(stats?.active_today)}
              label="Activos Hoy"
            />
            <StatCard
              mdi="alert-outline"
              tone="danger"
              value={fmt(stats?.alerts)}
              label="Alertas"
              alert={(stats?.alerts ?? 0) > 0}
            />
            <StatCard
              mdi="trending-up"
              value={stats != null ? `${stats.avg_adherence}%` : "—"}
              label="Progreso Prom."
            />
          </View>

          <View style={styles.metricsCard}>
            <View style={styles.metricsHeader}>
              <Text style={styles.metricsTitle}>Métricas de Hoy</Text>
              <MaterialCommunityIcons name="chart-bar" size={22} color={Colors.primary} />
            </View>

            <ProgressRow
              label="Sesiones completadas"
              value={sessionsValue}
              progress={sessionsProgress}
            />
            <ProgressRow
              label="Cumplimiento diario"
              value={compliance != null ? `${compliance}%` : "—"}
              progress={compliance ?? 0}
            />
          </View>
        </ScrollView>
      )}

      <BottomNav role="specialist" active="home" />

      <TouchableOpacity style={styles.backToSplash} onPress={() => router.replace("/" as any)}>
        <MaterialCommunityIcons name="home-outline" size={18} color={Colors.textPrimary} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 20,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  bannerTitle: {
    fontSize: 24,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.onPrimary,
    marginTop: 4,
  },
  backToSplash: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginHorizontal: 16,
  },
  metricsCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 20,
  },
  metricsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  metricsTitle: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
});
