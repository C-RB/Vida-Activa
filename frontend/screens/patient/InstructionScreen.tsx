import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import ExerciseVideo from "../../components/exercise/ExerciseVideo";
import NumberedSteps from "../../components/exercise/NumberedSteps";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import IconButton from "../../components/ui/IconButton";
import SegmentedProgress from "../../components/ui/SegmentedProgress";
import StateMessage from "../../components/ui/StateMessage";
import { EXERCISES } from "../../constants/exercises";
import { Colors, Type } from "../../constants/theme";
import { getActiveRoutine, RoutineExercise } from "../../services/routineService";
import { getExercises, Exercise } from "../../services/exerciseService";
import { getSession } from "../../services/authStore";

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
        const ordered = [...routine.exercises].sort((a, b) => a.order_index - b.order_index);
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
  const totalCount = totalExercises || EXERCISES.length;
  const instructions =
    catalog?.instructions && catalog.instructions.trim().length > 0
      ? splitInstructions(catalog.instructions)
      : FALLBACK_INSTRUCTIONS;
  const volume = routineExercise
    ? `${routineExercise.total_series} ${routineExercise.total_series === 1 ? "serie" : "series"} de ${routineExercise.total_reps}`
    : "";

  return (
    <Screen
      footer={
        <>
          <View style={styles.warning}>
            <Icon name="alertTriangle" size={18} />
            <Text style={[Type.secondary, styles.warningText]}>Si se marea, deténgase y siéntese.</Text>
          </View>
          <Button
            title="Comenzar"
            onPress={() =>
              router.push(`/active-exercise?index=${currentIndex}&sessionId=${sessionId ?? ""}&seIds=${seIds ?? ""}`)
            }
          />
        </>
      }
    >
      <View style={styles.bar}>
        <IconButton mdi="arrow-left" label="Volver" onPress={() => router.back()} />
        <View style={styles.progress}>
          <Text style={[Type.secondaryStrong, styles.progressText]}>
            Ejercicio {currentIndex + 1} de {totalCount}
          </Text>
          <SegmentedProgress total={totalCount} current={currentIndex + 1} />
        </View>
      </View>

      {exerciseId && VIDEO_MAP[exerciseId] && <ExerciseVideo source={VIDEO_MAP[exerciseId]} />}

      <View style={styles.heading}>
        <Text style={[Type.title1, styles.title]}>{exerciseName}</Text>
        {volume !== "" && <Text style={[Type.body, styles.volume]}>{volume}</Text>}
      </View>

      {loading ? <StateMessage loading /> : <NumberedSteps steps={instructions} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  progress: {
    flex: 1,
    gap: 8,
  },
  progressText: {
    color: Colors.textSecondary,
  },
  heading: {
    gap: 8,
  },
  title: {
    color: Colors.textPrimary,
  },
  volume: {
    color: Colors.textSecondary,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  warningText: {
    color: Colors.textSecondary,
  },
});
