import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import RoutineCard from "../../components/specialist/RoutineCard";
import FabButton from "../../components/ui/FabButton";
import StateMessage from "../../components/ui/StateMessage";
import { routes } from "../../router/routes";
import { deleteRoutine, getRoutinesByPatient, RoutineWithExercises } from "../../services/routineService";
import { formatDays, formatIsoDate, shortTime } from "../../utils/dates";

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
    setError(null);
    try {
      setRoutines(await getRoutinesByPatient(patientId));
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar las rutinas.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Reload on focus so a routine created or edited on the next screen shows up when coming back.
  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [loadRoutines])
  );

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
            Alert.alert("Error", e?.message ?? "No se pudo eliminar la rutina.");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <Screen
      title="Rutinas"
      subtitle="Las rutinas asignadas a este paciente."
      onBack={() => router.back()}
      nav={{ role: "specialist", active: "patients" }}
      floating={
        <FabButton
          mdi="plus"
          label="Crear rutina"
          text="Crear rutina"
          onPress={() => router.push({ pathname: routes.createRoutine as any, params: { patientId } })}
        />
      }
    >
      {loading ? (
        <StateMessage loading />
      ) : error ? (
        <StateMessage error={error} />
      ) : routines.length === 0 ? (
        <StateMessage empty="Este paciente aún no tiene rutinas asignadas." />
      ) : (
        routines.map((r) => (
          <RoutineCard
            key={r.id}
            routine={r}
            dayLabel={formatDays(r.days_of_week)}
            timeLabel={shortTime(r.scheduled_time)}
            rangeLabel={`${formatIsoDate(r.start_date)} – ${formatIsoDate(r.end_date)}`}
            deleting={deletingId === r.id}
            onEdit={() =>
              router.push({
                pathname: routes.createRoutine as any,
                params: { patientId, routineId: r.id },
              })
            }
            onDelete={() => handleDelete(r)}
          />
        ))
      )}
    </Screen>
  );
}
