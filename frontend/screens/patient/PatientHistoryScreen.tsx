import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomNav from "../../components/layout/BottomNav";
import { BannerStyle, Colors, GradientColors, Type } from "../../constants/theme";
import { getPatientById, Session } from "../../services/patientService";
import { getSession } from "../../services/authStore";
import SessionCard from "../../components/session/SessionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import StateMessage from "../../components/ui/StateMessage";

export default function PatientHistoryScreen() {
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
          <StateMessage loading />
        ) : sessions.length === 0 ? (
          <StateMessage empty="Aún no tienes sesiones registradas." />
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
    ...Type.title1,
    color: Colors.bannerTitle,
  },
  bannerSubtitle: {
    ...Type.body,
    color: Colors.bannerSubtitle,
    marginTop: 6,
  },



});
