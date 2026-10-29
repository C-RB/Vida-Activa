import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { routes } from "../../router/routes";
import { getExercises, Exercise } from "../../services/exerciseService";

import { Colors, GradientColors, Type } from "../../constants/theme";
import ExerciseCard from "../../components/specialist/ExerciseCard";
import StateMessage from "../../components/ui/StateMessage";
export default function ExercisesLibraryScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getExercises();
        if (active) setExercises(data);
      } catch (e: any) {
        if (active)
          setError(e?.message ?? "No se pudieron cargar los ejercicios");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd = (exercise: Exercise) => {
    router.push({
      pathname: routes.createRoutine as any,
      params: {
        patientId,
        selectedExercise: JSON.stringify(exercise),
      },
    });
  };

  const handleCancel = () => {
    router.push(routes.patientList as any);
  };

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerSubtitle}>Panel Profesional</Text>
            <Text style={styles.bannerTitle}>Biblioteca de Ejercicios</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {patientId ? (
          <Text style={styles.assignText}>
            Asignando rutina al paciente: {patientId}
          </Text>
        ) : null}

        <View style={styles.searchWrap}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={Colors.textPrimary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar Ejercicio..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.textPrimary}
            style={{ marginTop: 32 }}
          />
        ) : error ? (
          <StateMessage error={error} />
        ) : filtered.length === 0 ? (
          <StateMessage empty="No hay ejercicios para mostrar." />
        ) : (
          filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onAdd={handleAdd}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 80, paddingHorizontal: 16, paddingTop: 16 },
  banner: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  bannerSubtitle: {
    ...Type.label,
    color: Colors.onPrimary,
    marginBottom: 4,
  },
  bannerTitle: {
    ...Type.title2,
    color: Colors.textPrimary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assignText: {
    ...Type.label,
    marginBottom: 10,
    color: Colors.textPrimary,
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
    ...Type.label,
    flex: 1,
    color: Colors.textPrimary,
    padding: 0,
  },
  cancelBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    margin: 19,
    marginBottom: 129,
  },
  cancelText: { ...Type.secondaryStrong, color: Colors.onPrimary },
});
