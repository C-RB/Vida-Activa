import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";
import type { PatientListItem } from "../../services/patientService";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";

type Props = {
  patient: PatientListItem;
  onViewInfo: (id: string) => void;
  onAssignRoutine: (id: string) => void;
};

export default function PatientCard({ patient, onViewInfo, onAssignRoutine }: Props) {
  const meta = [patient.age != null ? `${patient.age} años` : null, patient.lastActivity]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card>
      <View style={styles.top}>
        <Avatar name={patient.fullName} size={44} />
        <View style={styles.info}>
          <Text style={Type.bodyStrong}>{patient.fullName}</Text>
          {meta !== "" && <Text style={[Type.secondary, styles.meta]}>{meta}</Text>}
        </View>
        {patient.hasAlert && <Badge label="Alerta" tone="warning" mdi="alert-outline" />}
      </View>

      {patient.alertMessage && (
        <Text style={[Type.secondary, styles.alert]}>{patient.alertMessage}</Text>
      )}

      <View style={styles.actions}>
        <Button
          compact
          variant="outline"
          title="Ver información"
          onPress={() => onViewInfo(patient.id)}
          style={styles.action}
        />
        <Button
          compact
          title="Asignar rutina"
          onPress={() => onAssignRoutine(patient.id)}
          style={styles.action}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  info: {
    flex: 1,
  },
  meta: {
    color: Colors.textSecondary,
  },
  alert: {
    color: Colors.warning,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  action: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
