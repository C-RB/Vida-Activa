import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import BottomNav from "../../components/layout/BottomNav";
import { BannerStyle, Colors, Fonts, GradientColors } from "../../constants/theme";
import { getPatientById, Session } from "../../services/patientService";
import { getSession } from "../../services/authStore";
import SessionCard from "../../components/session/SessionCard";
import SectionTitle from "../../components/ui/SectionTitle";

export default function PatientHistoryScreen() {
  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSession = getSession();
    const patientId = userSession?.patient?.id;

    if (patientId) {
      getPatientById(patientId)
        .then((data) => {
          setSessions(data.sessions || []);
        })
        .catch((error) => {
          console.error("Error fetching history:", error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Historial de sesiones</Text>
        <Text style={styles.bannerSubtitle}>
          Revisa tu progreso y celebra tus logros diarios.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionTitle>Tus sesiones recientes</SectionTitle>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.btnTeal} style={{ marginTop: 40 }} />
        ) : sessions.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
            Aún no tienes sesiones registradas.
          </Text>
        ) : (
          sessions.map((s) => <SessionCard key={s.id} session={s} expandable />)
        )}
      </ScrollView>

      <BottomNav role="patient" active="history" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  banner: { ...BannerStyle },
  bannerTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.bannerTitle,
  },
  bannerSubtitle: {
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: Colors.bannerSubtitle,
    marginTop: 6,
  },



});
