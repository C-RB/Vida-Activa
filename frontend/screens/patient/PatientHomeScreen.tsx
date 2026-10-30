import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "../../components/layout/BottomNav";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import { Colors, Type } from "../../constants/theme";
import {
  getNextAppointment,
  NextAppointment,
} from "../../services/appointmentService";
import {
  getActiveRoutine,
  getRoutinesByPatient,
  RoutineWithExercises,
} from "../../services/routineService";
import { getPatientById, Session } from "../../services/patientService";
import { getSession } from "../../services/authStore";

const WEEKDAYS_LONG = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];
const MONTHS_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const WEEK_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

// "Sábado 24 de octubre"
const formatLongDate = (d: Date): string =>
  `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;

// "2026-10-29" → "Jueves 29 de octubre"
const formatAppointmentDate = (date: string): string =>
  formatLongDate(new Date(`${date}T00:00:00`));

// 0 = Monday … 6 = Sunday
const mondayIndex = (d: Date): number => (d.getDay() + 6) % 7;

// Start (00:00) of the week of `d`, weeks starting on Monday.
const startOfWeek = (d: Date): Date => {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - mondayIndex(s));
  return s;
};

// "10:00:00" → "10:00"
const shortTime = (t: string): string => t.slice(0, 5);

export default function PatientHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const patient = getSession()?.patient;
  const patientId = patient?.id;
  const fullName = patient?.fullName ?? "";
  const firstName = fullName.split(" ")[0] ?? "";

  const [nextAppointment, setNextAppointment] =
    useState<NextAppointment | null>(null);
  const [routine, setRoutine] = useState<RoutineWithExercises | null>(null);
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNextAppointment()
      .then(setNextAppointment)
      .catch(() => setNextAppointment(null));
  }, []);

  // getActiveRoutine returns null (not an error) when there is no routine today.
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    Promise.all([
      getActiveRoutine(patientId).catch((e) => {
        console.error("Error fetching active routine:", e);
        return null;
      }),
      getRoutinesByPatient(patientId).catch(() => []),
      getPatientById(patientId)
        .then((p) => p.sessions)
        .catch(() => [] as Session[]),
    ])
      .then(([active, all, recent]) => {
        setRoutine(active);
        setRoutines(all);
        setSessions(recent);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  const goToSurvey = () => {
    if (!routine) return;
    router.push(`/previous-survey?routineId=${routine.id}`);
  };

  const today = useMemo(() => new Date(), []);

  const week = useMemo(() => {
    const start = startOfWeek(today);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const done = new Set<number>();
    sessions.forEach((s) => {
      if (!s.completed || !s.dateIso) return;
      const d = new Date(s.dateIso);
      if (d >= start && d < end) done.add(mondayIndex(d));
    });

    const planned = new Set<number>();
    routines.forEach((r) => {
      const from = new Date(`${r.start_date}T00:00:00`);
      const to = new Date(`${r.end_date}T23:59:59`);
      if (from < end && to >= start) planned.add((r.day_of_week - 1) % 7);
    });

    return {
      done,
      total: Math.max(planned.size, done.size),
      todayIdx: mondayIndex(today),
    };
  }, [sessions, routines, today]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Icon name="logo" size={40} />
          <Text style={[Type.title2, styles.brand]}>Vida Activa</Text>
          <Avatar name={fullName} />
        </View>

        <View style={styles.greeting}>
          <Text style={[Type.title1, styles.textPrimary]}>
            {firstName ? `Hola, ${firstName}` : "Hola"}
          </Text>
          <Text style={[Type.body, styles.textSecondary]}>
            {formatLongDate(today)}
          </Text>
        </View>

        <Card>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : routine ? (
            <>
              <View style={styles.row}>
                <Icon name="bell" size={52} />
                <View style={styles.flex}>
                  <Text style={[Type.secondary, styles.textSecondary]}>
                    Su próxima sesión
                  </Text>
                  <Text style={[Type.title2, styles.textPrimary]}>
                    Hoy a las {shortTime(routine.scheduled_time)}
                  </Text>
                  <Text
                    style={[Type.secondary, styles.textSecondary]}
                    numberOfLines={1}
                  >
                    {routine.name}
                  </Text>
                </View>
              </View>
              <Button
                title="Empezar ahora"
                variant="soft"
                compact
                onPress={goToSurvey}
              />
            </>
          ) : (
            <View style={styles.row}>
              <Icon name="bell" size={52} />
              <View style={styles.flex}>
                <Text style={[Type.secondary, styles.textSecondary]}>
                  Su próxima sesión
                </Text>
                <Text style={[Type.bodyStrong, styles.textPrimary]}>
                  Hoy no tiene sesión programada
                </Text>
              </View>
            </View>
          )}
        </Card>

        {week.total > 0 && (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={[Type.bodyStrong, styles.textPrimary]}>
                Esta semana
              </Text>
              <Text style={[Type.secondary, styles.textSecondary]}>
                {week.done.size} de {week.total}{" "}
                {week.total === 1 ? "sesión" : "sesiones"}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              {WEEK_LETTERS.map((letter, i) => {
                const isDone = week.done.has(i);
                const isToday = i === week.todayIdx;
                return (
                  <View key={i} style={styles.dayItem}>
                    <View
                      style={[
                        styles.dayCircle,
                        isDone && styles.dayCircleDone,
                        isToday && !isDone && styles.dayCircleToday,
                      ]}
                    >
                      {isDone && <Icon name="check" size={20} />}
                    </View>
                    <Text
                      style={[
                        Type.label,
                        { color: isToday ? Colors.primary : Colors.textSecondary },
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {nextAppointment && (
          <Card style={styles.row}>
            <View style={styles.infoBadge}>
              <Icon name="calendar" size={30} />
            </View>
            <View style={styles.flex}>
              <Text style={[Type.bodyStrong, styles.textPrimary]}>
                Próxima cita presencial
              </Text>
              <Text style={[Type.secondary, styles.textSecondary]}>
                {formatAppointmentDate(nextAppointment.date)} ·{" "}
                {nextAppointment.time}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <BottomNav role="patient" active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
  },
  flex: {
    flex: 1,
  },
  textPrimary: {
    color: Colors.textPrimary,
  },
  textSecondary: {
    color: Colors.textSecondary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brand: {
    flex: 1,
    color: Colors.textPrimary,
  },
  greeting: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
    gap: 6,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleDone: {
    backgroundColor: Colors.primarySoft,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  infoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.infoSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
