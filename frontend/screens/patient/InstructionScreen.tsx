import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { EXERCISES } from "../../constants/exercises";
import { Video, ResizeMode } from "expo-av";
import { getActiveRoutine, RoutineExercise } from "../../services/routineService";
import { getExercises, Exercise } from "../../services/exerciseService";
import { getSession } from "../../services/authStore";

import { Colors, GradientColors, Type } from "../../constants/theme";
const VIDEO_MAP: Record<string, any> = {
  toe_touch: require("../../assets/videos/toe_touch.mp4"),
  leg_raise: require("../../assets/videos/leg_raise.mp4"),
  shoulder_raises: require("../../assets/videos/shoulder_raises.mp4"),
  squat: require("../../assets/videos/squat.mp4"),
};

// Generic fallback steps, used only when the backend exercise has no `instructions`.
const FALLBACK_INSTRUCTIONS = [
  "Colócate en la posición inicial del ejercicio",
  "Realiza el movimiento de forma lenta y controlada",
  "Mantén la postura correcta durante toda la repetición",
  "Vuelve a la posición inicial y repite",
];

// Backend instructions arrive as one paragraph; split into sentences for the numbered list.
const splitInstructions = (text: string): string[] =>
  text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 0);

export default function InstructionScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  const { index, sessionId, seIds } = useLocalSearchParams();
  const currentIndex = Number(index ?? 0);

  // Re-fetch the active routine instead of passing it through params across instruction → active → instruction.
  // The index maps to routine.exercises ordered by order_index (the order the backend uses for session_exercises).
  const [routineExercise, setRoutineExercise] = useState<RoutineExercise | null>(null);
  const [catalog, setCatalog] = useState<Exercise | null>(null);
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const patientId = getSession()?.patient?.id;
    if (!patientId) {
      setLoading(false);
      return;
    }
    Promise.all([getActiveRoutine(patientId), getExercises()])
      .then(([routine, exercises]) => {
        if (!routine) return;
        const ordered = [...routine.exercises].sort(
          (a, b) => a.order_index - b.order_index
        );
        const re = ordered[currentIndex] ?? null;
        setRoutineExercise(re);
        setTotalExercises(ordered.length);
        if (re) {
          setCatalog(exercises.find((e) => e.id === re.exercise_id) ?? null);
        }
      })
      .catch((e) => console.error("Error cargando ejercicio:", e))
      .finally(() => setLoading(false));
  }, [currentIndex]);

  // Real exerciseId for the video; falls back to EXERCISES by index while the routine loads.
  const exerciseId = routineExercise?.exercise_id ?? EXERCISES[currentIndex]?.exerciseId;
  const exerciseName =
    catalog?.name ??
    EXERCISES.find((e) => e.exerciseId === exerciseId)?.exerciseName ??
    exerciseId ??
    "Ejercicio";
  const totalSeries = routineExercise?.total_series ?? null;
  const totalReps = routineExercise?.total_reps ?? null;
  const totalCount = totalExercises || EXERCISES.length;
  const instructions =
    catalog?.instructions && catalog.instructions.trim().length > 0
      ? splitInstructions(catalog.instructions)
      : FALLBACK_INSTRUCTIONS;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={32}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>{`Ejercicio ${currentIndex + 1} de ${totalCount}`}</Text>
          </View>
        </View>

        <View style={[styles.videoCard, { overflow: 'hidden' }]}>
          {exerciseId && VIDEO_MAP[exerciseId] && (
            <Video
              ref={videoRef}
              style={{ width: "100%", height: "100%" }}
              source={VIDEO_MAP[exerciseId]}
              useNativeControls
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
            />
          )}
          <TouchableOpacity
            style={styles.fullscreenButton}
            onPress={() => videoRef.current?.presentFullscreenPlayer()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="fullscreen" size={24} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.exerciseName}>{exerciseName}</Text>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.textPrimary} style={{ marginTop: 18 }} />
        ) : (
          <View style={styles.pillsRow}>
            <View style={styles.seriePill}>
              <Text style={styles.seriePillText}>
                {totalSeries != null ? `${totalSeries} Series` : "— Series"}
              </Text>
            </View>
            <View style={styles.repsPill}>
              <Text style={styles.repsPillText}>
                {totalReps != null ? `${totalReps} Repeticiones` : "— Repeticiones"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.instructionsList}>
          {instructions.map((instruction, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push(`/active-exercise?index=${currentIndex}&sessionId=${sessionId ?? ""}&seIds=${seIds ?? ""}`)}
      >
        <Text style={styles.startButtonText}>Iniciar Ejercicio</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginHorizontal: 16,
  },
  headerPill: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 12,
  },
  headerPillText: {
    ...Type.button,
    color: Colors.textPrimary,
  },
  videoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 24,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  fullscreenButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(23, 32, 51, 0.7)",
    borderRadius: 8,
    padding: 6,
  },
  videoCardText: {
    ...Type.title2,
    color: Colors.textPrimary,
    marginTop: 10,
  },
  exerciseName: {
    ...Type.title1,
    color: Colors.textPrimary,
    marginTop: 24,
    marginHorizontal: 16,
    textAlign: "center",
  },
  pillsRow: {
    flexDirection: "row",
    marginTop: 18,
    marginHorizontal: 16,
    gap: 10,
    flexWrap: 'wrap',
  },
  seriePill: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  seriePillText: {
    ...Type.title2,
    color: Colors.textPrimary,
  },
  repsPill: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  repsPillText: {
    ...Type.title2,
    color: Colors.textPrimary,
  },
  instructionsList: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  instructionNumber: {
    backgroundColor: Colors.primaryPressed,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionNumberText: {
    ...Type.title2,
    color: Colors.onPrimary,
  },
  instructionText: {
    ...Type.title2,
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: 14,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginHorizontal: 25,
    marginBottom: 30,
    marginTop: 16,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    ...Type.title1,
    color: Colors.onPrimary,
  },
});
