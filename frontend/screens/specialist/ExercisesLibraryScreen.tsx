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
import { useFonts } from "expo-font";
import { useLocalSearchParams, useRouter } from "expo-router";
import { routes } from "../../router/routes";
import { getExercises, Exercise } from "../../services/exerciseService";

import { Colors, GradientColors } from "../../constants/theme";
export default function ExercisesLibraryScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

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

  const ExerciseCard = ({
    exercise,
    onAdd,
  }: {
    exercise: Exercise;
    onAdd: (exercise: Exercise) => void;
  }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <MaterialCommunityIcons name="run" size={24} color={Colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardName}>{exercise.name}</Text>
          {exercise.description ? (
            <Text style={styles.cardMeta}>{exercise.description}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(exercise)}>
          <MaterialCommunityIcons name="plus" size={20} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {exercise.multimedia_url ? (
        <View style={styles.videoPlaceholder}>
          <MaterialCommunityIcons
            name="play-circle-outline"
            size={20}
            color={Colors.textPrimary}
          />
          <Text style={styles.videoText}>Video disponible</Text>
        </View>
      ) : null}
    </View>
  );

  if (!fontsLoaded) return null;

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
          <Text style={styles.errorText}>{error}</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No hay ejercicios para mostrar.</Text>
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
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.onPrimary,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assignText: {
    marginBottom: 10,
    fontFamily: "InterRegular",
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
  cardTop: { flexDirection: "row", alignItems: "center" },
  cardName: { fontSize: 15, fontFamily: "InterSemiBold", color: Colors.textPrimary },
  cardMeta: {
    fontSize: 12,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  videoPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },
  videoText: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
  },
  errorText: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.danger,
  },
  emptyText: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    margin: 19,
    marginBottom: 129,
  },
  cancelText: { fontSize: 16, fontFamily: "InterSemiBold", color: Colors.onPrimary },
});
