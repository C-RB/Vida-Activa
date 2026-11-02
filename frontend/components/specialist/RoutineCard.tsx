import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AdminType, Colors } from "../../constants/theme";
import type { RoutineWithExercises } from "../../services/routineService";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import IconButton from "../ui/IconButton";

type Props = {
  routine: RoutineWithExercises;
  // Already formatted for display.
  dayLabel: string;
  timeLabel: string;
  rangeLabel: string;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export default function RoutineCard({ routine, dayLabel, timeLabel, rangeLabel, deleting, onEdit, onDelete }: Props) {
  return (
    <Card>
      <View style={styles.top}>
        <IconBadge mdi="clipboard-list-outline" size={44} />
        <View style={styles.info}>
          <Text style={AdminType.bodyStrong}>{routine.name}</Text>
          <Text style={[AdminType.secondary, styles.meta]}>{routine.exercises.length} ejercicios</Text>
        </View>
        <IconButton mdi="pencil-outline" label="Editar rutina" onPress={onEdit} />
        <IconButton
          danger
          mdi="trash-can-outline"
          label="Eliminar rutina"
          loading={deleting}
          onPress={onDelete}
        />
      </View>
      <View style={styles.badges}>
        <Badge mdi="calendar-week-outline" label={dayLabel} />
        <Badge mdi="clock-outline" label={timeLabel} />
        <Badge mdi="calendar-range" label={rangeLabel} />
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
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
