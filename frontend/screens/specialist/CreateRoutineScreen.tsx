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
import { createRoutine } from "../../services/routineService";

const DEFAULT_WEEKS = 4;
const pad2 = (n: number) => n.toString().padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
// "HH:MM:00" for the PostgreSQL TIME column.
const backendTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
const shortDate = (d: Date) => d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });

const defaultTime = () => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  return d;
};

export default function CreateRoutineScreen() {
  const router = useRouter();
  const { type } = useDensity();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExercises()
      .then(setLibrary)
      .catch((e) => setLibraryError(e?.message ?? "No se pudieron cargar los ejercicios."));
  }, []);

  useEffect(() => {
    if (!patientId) return;
    getPatientById(patientId)
      .then((p) => setPatientName(p.fullName))
      .catch(() => setPatientName(""));
  }, [patientId]);

  // The routine starts today and lasts the chosen number of weeks.
  const start = new Date();
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

    setSaving(true);
    let saved = 0;
    try {
      // The backend stores one weekday per routine, so each chosen day is its own routine.
      for (const day of days) {
        await createRoutine({
          patient_id: patientId,
          name: name.trim(),
          start_date: isoDate(start),
          end_date: isoDate(end),
          day_of_week: day,
          scheduled_time: backendTime(time),
          exercises: items.map((item, index) => ({
            exercise_id: item.exercise_id,
            order_index: index,
            level: item.level,
            total_series: item.total_series,
            total_reps: item.total_reps,
            rest_time_seconds: item.rest_time_seconds,
          })),
        });
        saved += 1;
      }
      router.replace({ pathname: routes.routineList as any, params: { patientId } });
    } catch (e: any) {
      const partial = saved > 0 ? ` Se guardaron ${saved} de ${days.length} días.` : "";
      setError(`${e?.message ?? "No se pudo guardar la rutina."}${partial}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Nueva rutina" onBack={() => router.back()}>
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
      <Button title="Guardar rutina" loading={saving} onPress={handleSave} />

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
