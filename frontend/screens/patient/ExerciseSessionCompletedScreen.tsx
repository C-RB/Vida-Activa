import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BannerStyle, Colors, GradientColors, Type } from "../../constants/theme";
import { routes } from "../../router/routes";
import { completeSession, getSessionById } from "../../services/sessionService";
import InfoRow from "../../components/ui/InfoRow";
import SectionTitle from "../../components/ui/SectionTitle";
import StateMessage from "../../components/ui/StateMessage";

export default function ExerciseSessionCompletedScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // The session arrives already completed from PostExerciseSurveyScreen, so GET /api/sessions/{id} has the duration and series.
  const [loadingStats, setLoadingStats] = useState(true);
  const [exercisesCount, setExercisesCount] = useState<number | null>(null);
  const [seriesCount, setSeriesCount] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoadingStats(false);
      return;
    }
    getSessionById(sessionId)
      .then((s) => {
        setExercisesCount(s.session_exercises.length);
        setSeriesCount(
          s.session_exercises.reduce((sum, se) => sum + (se.series_completed ?? 0), 0)
        );
        setDurationMin(s.duration_minutes);
      })
      .catch((e) => console.error("Error cargando resumen de sesión:", e))
      .finally(() => setLoadingStats(false));
  }, [sessionId]);

  // "—" when there is no real data (no sessionId or the load failed).
  const fmt = (n: number | null) => (n != null ? `${n}` : "—");

  const handleComplete = async () => {
    setCompleteError(null);

    // Without a session_id there is nothing to complete on the backend: just navigate.
    if (!sessionId) {
      router.replace(routes.patientHistory as any);
      return;
    }

    setCompleting(true);
    try {
      await completeSession(sessionId);
      router.replace(routes.patientHistory as any);
    } catch (e: any) {
      setCompleteError(e?.message ?? "No se pudo completar la sesión");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Sesión completada</Text>
        <Text style={styles.bannerSubtitle}>Tu esfuerzo de hoy quedó registrado</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="trophy-outline" size={72} color={Colors.btnTeal} />
          </View>
          <Text style={styles.heroTitle}>¡Excelente trabajo!</Text>
          <Text style={styles.heroSubtitle}>
            Terminaste tu sesión de ejercicios y eso ya es un gran logro.
          </Text>
        </View>

        <SectionTitle>Resumen de la sesión</SectionTitle>
        <View style={styles.statsCard}>
          {loadingStats ? (
            <ActivityIndicator color={Colors.btnTeal} style={{ paddingVertical: 24 }} />
          ) : (
            <>
              <InfoRow
                inline
                mdi="dumbbell"
                label="Ejercicios completados"
                value={fmt(exercisesCount)}
              />
              <View style={styles.divider} />
              <InfoRow
                inline
                mdi="repeat-variant"
                label="Series realizadas"
                value={fmt(seriesCount)}
              />
              <View style={styles.divider} />
              <InfoRow
                inline
                mdi="clock-outline"
                label="Duración total"
                value={durationMin != null ? `${durationMin} min` : "—"}
              />
              <View style={styles.divider} />
              <InfoRow
                inline
                mdi="check-circle-outline"
                label="Estado"
                value="Completada"
                highlight
              />
            </>
          )}
        </View>

        <View style={styles.quoteCard}>
          <MaterialCommunityIcons name="heart-pulse" size={28} color={Colors.btnTeal} />
          <Text style={styles.quoteText}>
            Cada sesión te acerca un paso más a tu objetivo. ¡Sigue así!
          </Text>
        </View>

        {completeError && (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={26} color={Colors.danger} />
            <StateMessage error={completeError} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.cta, completing && styles.ctaDisabled]}
          onPress={handleComplete}
          disabled={completing}
          activeOpacity={0.85}
        >
          {completing ? (
            <ActivityIndicator color={Colors.textOnDark} />
          ) : (
            <Text style={styles.ctaText}>{completeError ? "Reintentar  →" : "Completar  →"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

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

  heroCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: Colors.btnTeal,
  },
  heroIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.cardBgAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    ...Type.title1,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  heroSubtitle: {
    ...Type.body,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 10,
  },

  statsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: Colors.btnTeal,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(23, 32, 51, 0.15)",
  },

  quoteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.cardBgAlt,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.btnTeal,
  },
  quoteText: {
    ...Type.body,
    flex: 1,
    color: Colors.textPrimary,
  },

  cta: {
    backgroundColor: Colors.btnPrimary,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
  },
  ctaText: {
    ...Type.title1,
    color: Colors.textOnDark,
  },
  ctaDisabled: {
    opacity: 0.6,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.cardBgAlt,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
});
