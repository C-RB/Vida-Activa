import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import PatientRow from "../../components/specialist/PatientRow";
import Card from "../../components/ui/Card";
import FabButton from "../../components/ui/FabButton";
import ProgressRow from "../../components/ui/ProgressRow";
import SectionTitle from "../../components/ui/SectionTitle";
import StateMessage from "../../components/ui/StateMessage";
import type { IconName } from "../../constants/icons";
import { Colors } from "../../constants/theme";
import { routes } from "../../router/routes";
import { DashboardAttention, DashboardResponse, getDashboard } from "../../services/specialistService";
import { formatLongDate } from "../../utils/dates";

const ICON_BY_KIND: Record<DashboardAttention["kind"], IconName> = {
  pain: "pain",
  inactive: "alertTriangle",
  no_sessions: "alertTriangle",
};

export default function SpecialistHomeScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch((e) => setError(e?.message ?? "No se pudo cargar el panel."))
      .finally(() => setLoading(false));
  }, []);

  const fullName = dashboard?.specialist.full_name ?? "";
  const firstName = fullName.split(" ")[0] ?? "";
  const progress = dashboard?.progress;
  const done = progress?.sessions_completed_today ?? 0;
  const total = progress?.sessions_total_today ?? 0;
  const followed = dashboard?.stats.total_patients ?? 0;

  const openRecord = (patientId: string) =>
    router.push({ pathname: routes.medicalRecord as any, params: { patientId } });

  return (
    <Screen
      brand
      avatarName={fullName}
      title={firstName ? `Hola, ${firstName}` : "Hola"}
      subtitle={formatLongDate(new Date())}
      nav={{ role: "specialist", active: "home" }}
      floating={
        <FabButton
          mdi="plus"
          label="Agregar paciente"
          text="Agregar paciente"
          onPress={() => router.push(routes.assignPatient as any)}
        />
      }
    >
      {loading ? (
        <StateMessage loading />
      ) : error ? (
        <StateMessage error={error} />
      ) : (
        <>
          <SectionTitle>Necesitan atención</SectionTitle>
          {dashboard && dashboard.attention.length > 0 ? (
            <Card style={styles.list}>
              {dashboard.attention.map((item, i) => (
                <View key={item.patient_id} style={i > 0 && styles.separator}>
                  <PatientRow
                    name={item.full_name}
                    reason={item.reason}
                    icon={ICON_BY_KIND[item.kind]}
                    onPress={() => openRecord(item.patient_id)}
                  />
                </View>
              ))}
            </Card>
          ) : (
            <StateMessage empty="Ningún paciente necesita atención por ahora." />
          )}

          <Card>
            <ProgressRow
              label="Sesiones de hoy"
              value={`${done} de ${total}`}
              progress={total > 0 ? (done / total) * 100 : 0}
              caption={`${followed} ${followed === 1 ? "paciente" : "pacientes"} en seguimiento`}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
    padding: 0,
    overflow: "hidden",
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
