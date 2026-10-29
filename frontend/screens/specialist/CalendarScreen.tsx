import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { useLocalSearchParams } from "expo-router";
import { getAppointmentsByDate, Appointment } from "../../services/calendarService";
import SpecialistNavbar from "../../components/SpecialistNavbar";

import { Colors, GradientColors } from "../../constants/theme";

const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type CalDay = { day: number; inMonth: boolean };

function buildCalendar(year: number, month: number): CalDay[][] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const flat: CalDay[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    flat.push({ day: daysInPrev - i, inMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    flat.push({ day: d, inMonth: true });
  }

  let next = 1;
  while (flat.length % 7 !== 0) {
    flat.push({ day: next++, inMonth: false });
  }

  const weeks: CalDay[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7));
  }

  return weeks;
}

export default function CalendarScreen() {
  // Optional date (YYYY-MM-DD) received when coming from the schedule screen.
  const { date } = useLocalSearchParams<{ date?: string }>();

  // Today at 00:00:00, to compare dates correctly
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);

  // Start on the date of a just-booked appointment if we came from one, otherwise today.
  const initialDate = date ? new Date(`${date}T00:00:00`) : todayDateObj;

  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDate.getDate());
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  useEffect(() => {
    if (!selectedDay) return;

    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const formattedMonth = String(month + 1).padStart(2, "0");
        const formattedDay = String(selectedDay).padStart(2, "0");
        const dateString = `${year}-${formattedMonth}-${formattedDay}`;

        const data = await getAppointmentsByDate(dateString);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDay, month, year]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  if (!fontsLoaded) return null;

  const weeks = buildCalendar(year, month);

  return (
    <LinearGradient colors={GradientColors as any} style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Calendario</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.calendarCard}>
            
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTHS_ES[month]} {year}
              </Text>
              <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.calRow}>
              {DAYS_ES.map((d) => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.calRow}>
                {week.map((cell, di) => {
                  const cellDate = new Date(year, month, cell.day);
                  const isPast = cellDate < todayDateObj;
                  
                  const isSelected = cell.inMonth && cell.day === selectedDay;
                  // Disabled for past days and days outside the current month
                  const isDisabled = !cell.inMonth || isPast;

                  return (
                    <TouchableOpacity
                      key={di}
                      style={[styles.calCell, isSelected && styles.calCellSelected]}
                      onPress={() => {
                        if (!isDisabled) setSelectedDay(cell.day);
                      }}
                      activeOpacity={isDisabled ? 1 : 0.7}
                      disabled={isDisabled}
                    >
                      <Text
                        style={[
                          styles.calCellText,
                          isDisabled && styles.calCellGray,
                          isSelected && styles.calCellTextSelected,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            Citas {selectedDay ? `el ${selectedDay} de ${MONTHS_ES[month]}` : "Programadas"}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : !selectedDay ? (
            <Text style={styles.emptyText}>Selecciona un día para ver las citas.</Text>
          ) : appointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="calendar-check" size={40} color={Colors.onPrimary} />
              <Text style={styles.emptyText}>No hay citas para esta fecha.</Text>
            </View>
          ) : (
            appointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentPatient}>{appointment.patientName}</Text>
                  <View style={[
                    styles.statusBadge
                  ]}>
                    <Text style={[
                      styles.statusBadgeText
                    ]}>
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={Colors.primary} />
                    <Text style={styles.detailText}>{appointment.displayFullDate}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.primary} />
                    <Text style={styles.detailText}>{appointment.time}</Text>
                  </View>
                </View>

              </View>
            ))
          )}

        </ScrollView>

        <SpecialistNavbar active="calendar" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  banner: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: 'InterSemiBold',
    color: Colors.onPrimary,
  },

  calendarCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  calRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "InterSemiBold",
    color: "rgba(23, 32, 51, 0.5)",
    paddingBottom: 6,
  },
  calCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 20,
  },
  calCellSelected: {
    backgroundColor: Colors.primaryPressed,
    borderRadius: 20,
  },
  calCellText: {
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
  },
  calCellGray: {
    color: "rgba(23, 32, 51, 0.25)",
  },
  calCellTextSelected: {
    color: Colors.onPrimary,
    fontFamily: "InterSemiBold",
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    marginBottom: 16,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.6)",
    textAlign: "center",
    marginTop: 10,
  },

  appointmentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentPatient: {
    fontSize: 16,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: "InterSemiBold",
    letterSpacing: 0.5,
  },
  appointmentDetails: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
  },
});