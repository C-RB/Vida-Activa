import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "../../components/layout/BottomNav";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import SegmentedControl from "../../components/ui/SegmentedControl";
import SettingRow from "../../components/ui/SettingRow";
import Toggle from "../../components/ui/Toggle";
import { Colors, Type } from "../../constants/theme";
import { routes } from "../../router/routes";
import { clearAuth, getSession } from "../../services/authStore";
import { getNextAppointment, NextAppointment } from "../../services/appointmentService";
import { formatLongDate } from "../../utils/dates";

const TEXT_SIZES = ["A", "A+", "A++"] as const;

export default function PatientProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const patient = getSession()?.patient;
  const fullName = patient?.fullName ?? "";

  const [appointment, setAppointment] = useState<NextAppointment | null>(null);
  const [textSize, setTextSize] = useState<(typeof TEXT_SIZES)[number]>("A");
  const [voice, setVoice] = useState(false);
  const [contrast, setContrast] = useState(false);

  useEffect(() => {
    getNextAppointment()
      .then(setAppointment)
      .catch(() => setAppointment(null));
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.replace(routes.login as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Type.title1, styles.textPrimary]}>Mi perfil</Text>

        <Card style={styles.row}>
          <Avatar name={fullName} size={64} />
          <View style={styles.flex}>
            <Text style={[Type.title2, styles.textPrimary]}>{fullName}</Text>
            {patient?.age != null && (
              <Text style={[Type.secondary, styles.textSecondary]}>{patient.age} años</Text>
            )}
          </View>
        </Card>

        {appointment && (
          <Card style={styles.card}>
            <Text style={[Type.secondary, styles.textSecondary]}>Mi especialista</Text>
            <View style={styles.row}>
              <Avatar name={appointment.specialistName} size={52} />
              <Text style={[Type.bodyStrong, styles.textPrimary, styles.flex]}>
                {appointment.specialistName}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Icon name="calendarLine" size={22} />
              <View>
                <Text style={[Type.label, styles.textSecondary]}>Próxima cita</Text>
                <Text style={[Type.bodyStrong, styles.textPrimary]}>
                  {formatLongDate(new Date(`${appointment.date}T00:00:00`))} · {appointment.time}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={[Type.secondary, styles.textSecondary]}>Para ver y oír mejor</Text>
          <SettingRow icon="letter" label="Letra">
            <SegmentedControl options={TEXT_SIZES} value={textSize} onChange={setTextSize} />
          </SettingRow>
          <SettingRow icon="speaker" label="Instrucciones por voz">
            <Toggle label="Instrucciones por voz" value={voice} onChange={setVoice} />
          </SettingRow>
          <SettingRow icon="contrast" label="Alto contraste">
            <Toggle label="Alto contraste" value={contrast} onChange={setContrast} />
          </SettingRow>
        </Card>

        <Button title="Cerrar sesión" variant="text" onPress={handleLogout} />
      </ScrollView>

      <BottomNav role="patient" active="profile" />
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
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  card: {
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  textPrimary: {
    color: Colors.textPrimary,
  },
  textSecondary: {
    color: Colors.textSecondary,
  },
});
