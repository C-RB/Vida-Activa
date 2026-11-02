import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import ExerciseCard from "../../components/specialist/ExerciseCard";
import RoutineExerciseCard, { BuilderItem } from "../../components/specialist/RoutineExerciseCard";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DayPicker from "../../components/ui/DayPicker";
import FormDialog from "../../components/ui/FormDialog";
import SectionTitle from "../../components/ui/SectionTitle";
import StateMessage from "../../components/ui/StateMessage";
import Stepper from "../../components/ui/Stepper";
import TextField from "../../components/ui/TextField";
import TimeField from "../../components/ui/TimeField";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import { routes } from "../../router/routes";
import { Exercise, getExercises } from "../../services/exerciseService";
import { getPatientById } from "../../services/patientService";
import { createRoutine, getRoutinesByPatient, updateRoutine } from "../../services/routineService";

const DEFAULT_WEEKS = 4;
const pad2 = (n: number) => n.toString().padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
// "HH:MM:00" for the PostgreSQL TIME column.
const backendTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
const shortDate = (d: Date) => d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });

// "10:30:00" → a Date today at that time.
const timeToDate = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const defaultTime = () => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  return d;
};

export default function CreateRoutineScreen() {
  const router = useRouter();
  const { type } = useDensity();
  const { patientId, routineId } = useLocalSearchParams<{ patientId: string; routineId?: string }>();
  const editing = Boolean(routineId);

  const [patientName, setPatientName] = useState("");
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [items, setItems] = useState<BuilderItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [days, setDays] = useState<number[]>([]);
  const [time, setTime] = useState<Date>(defaultTime);
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  // When editing, the routine keeps the date it started on.
  const [startedOn, setStartedOn] = useState<Date | null>(null);
  const [loadingRoutine, setLoadingRoutine] = useState(editing);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExercises()
      .then(setLibrary)
      .catch((e) => {
        setLibraryError(e?.message ?? "No se pudieron cargar los ejercicios.");
        setLoadingRoutine(false);
      });
  }, []);

  useEffect(() => {
    if (!patientId) return;
    getPatientById(patientId)
      .then((p) => setPatientName(p.fullName))
      .catch(() => setPatientName(""));
  }, [patientId]);

  // Editing: load the routine and fill the form once the exercise library is there (it provides the names).
  useEffect(() => {
    if (!routineId || !patientId || library.length === 0) return;
    getRoutinesByPatient(patientId)
      .then((all) => {
        const routine = all.find((r) => r.id === routineId);
        if (!routine) {
          setError("No se encontró la rutina.");
          return;
        }
        const from = new Date(`${routine.start_date}T00:00:00`);
        const to = new Date(`${routine.end_date}T00:00:00`);
        setName(routine.name);
        setDays(routine.days_of_week);
        setTime(timeToDate(routine.scheduled_time));
        setStartedOn(from);
        setWeeks(Math.max(1, Math.ceil(((to.getTime() - from.getTime()) / 86400000 + 1) / 7)));
        setItems(
          routine.exercises.map((e) => ({
            exercise_id: e.exercise_id,
            name: library.find((ex) => ex.id === e.exercise_id)?.name ?? e.exercise_id,
            level: e.level,
            total_series: e.total_series,
            total_reps: e.total_reps,
            rest_time_seconds: e.rest_time_seconds ?? 30,
          }))
        );
      })
      .catch((e) => setError(e?.message ?? "No se pudo cargar la rutina."))
      .finally(() => setLoadingRoutine(false));
  }, [routineId, patientId, library]);

  // New routines start today; either way they last the chosen number of weeks.
  const start = startedOn ?? new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + weeks * 7 - 1);

  const available = library.filter((ex) => !items.some((i) => i.exercise_id === ex.id));

  const addExercise = (ex: Exercise) => {
    setItems((prev) => [
      ...prev,
      { exercise_id: ex.id, name: ex.name, level: 1, total_series: 3, total_reps: 10, rest_time_seconds: 30 },
    ]);
    setExpanded(ex.id);
    setPickerOpen(false);
  };

  const updateItem = (id: string, changes: Partial<BuilderItem>) =>
    setItems((prev) => prev.map((i) => (i.exercise_id === id ? { ...i, ...changes } : i)));

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.exercise_id !== id));
    setExpanded(null);
  };

  const handleSave = async () => {
    setError(null);
    if (!patientId) return setError("No se recibió el paciente.");
    if (!name.trim()) return setError("Escriba un nombre para la rutina.");
    if (items.length === 0) return setError("Añada al menos un ejercicio.");
    if (days.length === 0) return setError("Elija al menos un día.");

    const payload = {
      patient_id: patientId,
      name: name.trim(),
      start_date: isoDate(start),
      end_date: isoDate(end),
      days_of_week: days,
      scheduled_time: backendTime(time),
      exercises: items.map((item, index) => ({
        exercise_id: item.exercise_id,
        order_index: index,
        level: item.level,
        total_series: item.total_series,
        total_reps: item.total_reps,
        rest_time_seconds: item.rest_time_seconds,
      })),
    };

    setSaving(true);
    try {
      if (routineId) await updateRoutine(routineId, payload);
      else await createRoutine(payload);
      router.replace({ pathname: routes.routineList as any, params: { patientId } });
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar la rutina.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title={editing ? "Editar rutina" : "Nueva rutina"} onBack={() => router.back()}>
      {patientName !== "" && (
        <View style={styles.patient}>
          <Avatar name={patientName} size={40} />
          <Text style={[type.bodyStrong, styles.textPrimary]}>Para {patientName}</Text>
        </View>
      )}

      <TextField
        label="Nombre de la rutina"
        value={name}
        onChangeText={setName}
        placeholder="Ej. Rehabilitación lumbar"
      />

      <SectionTitle>1. Ejercicios</SectionTitle>
      {items.map((item) => (
        <RoutineExerciseCard
          key={item.exercise_id}
          item={item}
          expanded={expanded === item.exercise_id}
          onToggle={() => setExpanded(item.exercise_id)}
          onRemove={() => removeItem(item.exercise_id)}
          onChange={(changes) => updateItem(item.exercise_id, changes)}
        />
      ))}
      <Button title="+ Añadir ejercicio" variant="outline" onPress={() => setPickerOpen(true)} />

      <SectionTitle>2. ¿Cuándo le llega el aviso?</SectionTitle>
      <Card>
        <Text style={[type.secondary, styles.textSecondary]}>Días</Text>
        <DayPicker value={days} onChange={setDays} />
        <TimeField label="Hora del aviso" value={time} onChange={setTime} />
        <Stepper label="Duración (semanas)" value={weeks} min={1} onChange={setWeeks} />
        <Text style={[type.secondary, styles.textSecondary]}>
          Del {shortDate(start)} al {shortDate(end)}
        </Text>
      </Card>

      {error && <StateMessage error={error} />}
      <Button title={editing ? "Guardar cambios" : "Guardar rutina"} loading={saving || loadingRoutine} onPress={handleSave} />

      <FormDialog
        visible={pickerOpen}
        title="Añadir ejercicio"
        confirmLabel="Listo"
        onConfirm={() => setPickerOpen(false)}
        onCancel={() => setPickerOpen(false)}
      >
        {libraryError ? (
          <StateMessage error={libraryError} />
        ) : available.length === 0 ? (
          <StateMessage empty="No quedan ejercicios por añadir." />
        ) : (
          available.map((ex) => <ExerciseCard key={ex.id} exercise={ex} onAdd={addExercise} />)
        )}
      </FormDialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  patient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textPrimary: {
    color: Colors.textPrimary,
  },
  textSecondary: {
    color: Colors.textSecondary,
  },
});
