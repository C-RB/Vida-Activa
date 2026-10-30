import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomNav from "../../components/layout/BottomNav";
import { BannerStyle, Colors, GradientColors, Type } from "../../constants/theme";
import { routes } from "../../router/routes";
import {
  deleteRoutine,
  getRoutinesByPatient,
  RoutineWithExercises,
} from "../../services/routineService";
import RoutineCard from "../../components/specialist/RoutineCard";
import { formatIsoDate, weekdayName } from "../../utils/dates";
import StateMessage from "../../components/ui/StateMessage";

export default function RoutineListScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();

  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRoutines = useCallback(async () => {
    if (!patientId) {
      setError("No se recibió el paciente.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getRoutinesByPatient(patientId);
      setRoutines(data);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar las rutinas");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleCreate = () => {
    router.push({ pathname: routes.createRoutine as any, params: { patientId } });
  };

  const handleDelete = (routine: RoutineWithExercises) => {
    Alert.alert("¿Eliminar rutina?", `Se eliminará "${routine.name}".`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setDeletingId(routine.id);
          try {
            await deleteRoutine(routine.id);
            await loadRoutines();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.message ?? "No se pudo eliminar la rutina."
            );
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerSubtitle}>Panel Profesional</Text>
            <Text style={styles.bannerTitle}>Rutinas del Paciente</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.textPrimary}
            style={{ marginTop: 40 }}
          />
        ) : error ? (
          <StateMessage error={error} />
        ) : routines.length === 0 ? (
          <StateMessage empty="
            Este paciente aún no tiene rutinas asignadas.
          " />
        ) : (
          routines.map((r) => (
            <RoutineCard
              key={r.id}
              routine={r}
              dayLabel={weekdayName(r.day_of_week)}
              rangeLabel={`${formatIsoDate(r.start_date)} – ${formatIsoDate(r.end_date)}`}
              deleting={deletingId === r.id}
              onDelete={() => handleDelete(r)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.primaryCta}
        onPress={handleCreate}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={20}
          color={Colors.textOnDark}
        />
        <Text style={styles.primaryCtaText}>Crear rutina</Text>
      </TouchableOpacity>

      <BottomNav role="specialist" active="patients" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  banner: { ...BannerStyle },
  bannerRow: { flexDirection: "row", alignItems: "center" },
  bannerSubtitle: {
    ...Type.label,
    color: Colors.bannerSubtitle,
    marginBottom: 4,
  },
  bannerTitle: {
    ...Type.title2,
    color: Colors.bannerTitle,
  },



  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.btnPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  primaryCtaText: {
    ...Type.secondaryStrong,
    color: Colors.textOnDark,
  },
});
