import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFonts } from "expo-font";
import { routes } from "../../router/routes";
import { BannerStyle, Colors, Fonts, GradientColors } from "../../constants/theme";
import { getExercises, Exercise } from "../../services/exerciseService";
import { createRoutine, RoutineCreate } from "../../services/routineService";
import Stepper from "../../components/ui/Stepper";
import SectionTitle from "../../components/ui/SectionTitle";
import StateMessage from "../../components/ui/StateMessage";

// Exercise inside the routine being built (editable by the specialist).
type BuilderItem = {
  exercise_id: string;
  name: string;
  level: number;
  total_series: number;
  total_reps: number;
  rest_time_seconds: number;
};

// Backend day_of_week: 1 = Monday … 7 = Sunday.
const DAYS: { value: number; label: string }[] = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
];

const LEVELS = [1, 2, 3];

const pad2 = (n: number) => n.toString().padStart(2, "0");
// "HH:MM" for display.
const formatDisplayTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
// "HH:MM:00" for the PostgreSQL TIME column.
const formatBackendTime = (d: Date) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;

export default function CreateRoutineScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();

  const [available, setAvailable] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exercisesError, setExercisesError] = useState<string | null>(null);

  const [selected, setSelected] = useState<BuilderItem[]>([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingExercises(true);
      setExercisesError(null);
      try {
        const data = await getExercises();
        if (active) setAvailable(data);
      } catch (e: any) {
        if (active)
          setExercisesError(e?.message ?? "No se pudieron cargar los ejercicios");
      } finally {
        if (active) setLoadingExercises(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isAdded = (id: string) => selected.some((s) => s.exercise_id === id);

  const handleAdd = (ex: Exercise) => {
    if (isAdded(ex.id)) return;
    setSelected((prev) => [
      ...prev,
      {
        exercise_id: ex.id,
        name: ex.name,
        level: 1,
        total_series: 3,
        total_reps: 10,
        rest_time_seconds: 30,
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.exercise_id !== id));
  };

  const updateItem = <K extends keyof BuilderItem>(
    id: string,
    field: K,
    value: BuilderItem[K]
  ) => {
    setSelected((prev) =>
      prev.map((s) => (s.exercise_id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setSaveError(null);

    if (!patientId) return setSaveError("No se recibió el paciente.");
    if (!name.trim()) return setSaveError("Ingresá un nombre para la rutina.");
    if (selected.length === 0)
      return setSaveError("Agregá al menos un ejercicio.");
    if (!startDate.trim() || !endDate.trim())
      return setSaveError("Completá las fechas (YYYY-MM-DD).");
    if (!scheduledTime)
      return setSaveError("Seleccioná la hora de la rutina.");

    const payload: RoutineCreate = {
      patient_id: patientId,
      name: name.trim(),
      start_date: startDate.trim(),
      end_date: endDate.trim(),
      day_of_week: dayOfWeek,
      scheduled_time: formatBackendTime(scheduledTime),
      exercises: selected.map((s, index) => ({
        exercise_id: s.exercise_id,
        order_index: index,
        level: s.level,
        total_series: s.total_series,
        total_reps: s.total_reps,
        rest_time_seconds: s.rest_time_seconds,
      })),
    };

    setSaving(true);
    try {
      await createRoutine(payload);
      router.replace({
        pathname: routes.routineList as any,
        params: { patientId },
      });
    } catch (e: any) {
      setSaveError(e?.message ?? "No se pudo guardar la rutina");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push(routes.patientList as any);

  if (!fontsLoaded) {
    return (
      <LinearGradient colors={GradientColors as any} style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.btnTeal} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerSubtitle}>Panel Profesional</Text>
        <Text style={styles.bannerTitle}>Crear Rutina</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <SectionTitle>Datos de la rutina</SectionTitle>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Rehabilitación lumbar"
            placeholderTextColor="rgba(23, 32, 51, 0.4)"
          />

          <View style={styles.rowBlock}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Inicio (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2026-06-13"
                placeholderTextColor="rgba(23, 32, 51, 0.4)"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Fin (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="2026-07-13"
                placeholderTextColor="rgba(23, 32, 51, 0.4)"
                autoCapitalize="none"
              />
            </View>
          </View>

          <Text style={styles.label}>Hora</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.timeInputText,
                !scheduledTime && styles.timeInputPlaceholder,
              ]}
            >
              {scheduledTime ? formatDisplayTime(scheduledTime) : "Seleccionar hora"}
            </Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={scheduledTime ?? new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event: DateTimePickerEvent, date?: Date) => {
                // On Android the picker closes itself after the interaction.
                if (Platform.OS !== "ios") setShowTimePicker(false);
                if (event.type === "set" && date) setScheduledTime(date);
              }}
            />
          )}

          <Text style={styles.label}>Día de la semana</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d) => {
              const active = dayOfWeek === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.dayBtn, active && styles.dayBtnActive]}
                  onPress={() => setDayOfWeek(d.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Ejercicios disponibles</SectionTitle>

          {loadingExercises ? (
            <ActivityIndicator
              size="large"
              color={Colors.textPrimary}
              style={{ marginTop: 16 }}
            />
          ) : exercisesError ? (
            <StateMessage error={exercisesError} />
          ) : available.length === 0 ? (
            <Text style={styles.mutedText}>No hay ejercicios en la biblioteca.</Text>
          ) : (
            available.map((ex) => {
              const added = isAdded(ex.id);
              return (
                <View key={ex.id} style={styles.libraryRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.libraryName}>{ex.name}</Text>
                    {ex.description ? (
                      <Text style={styles.libraryDesc}>{ex.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={[styles.addBtn, added && styles.addBtnDisabled]}
                    onPress={() => handleAdd(ex)}
                    disabled={added}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name={added ? "check" : "plus"}
                      size={16}
                      color={Colors.textOnDark}
                    />
                    <Text style={styles.addText}>
                      {added ? "Agregado" : "Agregar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Rutina en construcción ({selected.length})
          </Text>

          {selected.length === 0 ? (
            <Text style={styles.mutedText}>
              Agregá ejercicios desde la lista de arriba.
            </Text>
          ) : (
            selected.map((item) => (
              <View key={item.exercise_id} style={styles.builderCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemove(item.exercise_id)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={18}
                      color={Colors.textOnDark}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Nivel</Text>
                <View style={styles.levelRow}>
                  {LEVELS.map((lvl) => {
                    const active = item.level === lvl;
                    return (
                      <TouchableOpacity
                        key={lvl}
                        style={[styles.levelBtn, active && styles.levelBtnActive]}
                        onPress={() => updateItem(item.exercise_id, "level", lvl)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.levelText,
                            active && styles.levelTextActive,
                          ]}
                        >
                          {lvl}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.rowBlock}>
                  <Stepper
                    label="Series"
                    value={item.total_series}
                    onChange={(v) =>
                      updateItem(item.exercise_id, "total_series", v)
                    }
                  />
                  <Stepper
                    label="Repeticiones"
                    value={item.total_reps}
                    onChange={(v) =>
                      updateItem(item.exercise_id, "total_reps", v)
                    }
                  />
                </View>

                <Stepper
                  label="Descanso (seg)"
                  value={item.rest_time_seconds}
                  step={5}
                  onChange={(v) =>
                    updateItem(item.exercise_id, "rest_time_seconds", v)
                  }
                />
              </View>
            ))
          )}
        </View>

        {saveError ? <StateMessage error={saveError} /> : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.textOnDark} />
            ) : (
              <Text style={styles.saveText}>Guardar rutina</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 32 },

  banner: { ...BannerStyle },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.bannerSubtitle,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.bannerTitle,
  },

  section: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.btnTeal,
    padding: 14,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.cardBgAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBgAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  timeInputText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  timeInputPlaceholder: {
    color: "rgba(23, 32, 51, 0.4)",
  },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.cardBgAlt,
    alignItems: "center",
  },
  dayBtnActive: { backgroundColor: Colors.btnPrimary },
  dayText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  dayTextActive: { fontFamily: Fonts.bold, color: Colors.textOnDark },

  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBgAlt,
  },
  libraryName: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  libraryDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.btnTeal,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
  },
  addBtnDisabled: { opacity: 0.5 },
  addText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textOnDark,
  },

  builderCard: {
    backgroundColor: Colors.cardBgAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: Colors.btnDanger,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  levelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.cardBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.btnTeal,
  },
  levelBtnActive: { backgroundColor: Colors.btnPrimary, borderColor: Colors.btnPrimary },
  levelText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  levelTextActive: { color: Colors.textOnDark },

  rowBlock: { flexDirection: "row", gap: 12, marginBottom: 12 },
  fieldHalf: { flex: 1 },

  mutedText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.btnDanger,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.textOnDark,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.btnPrimary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.textOnDark,
  },
});
