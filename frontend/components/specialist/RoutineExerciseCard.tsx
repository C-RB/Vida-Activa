import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import ChipGroup from "../ui/ChipGroup";
import Card from "../ui/Card";
import FormField from "../ui/FormField";
import Icon from "../ui/Icon";
import Stepper from "../ui/Stepper";

// Exercise inside the routine being built (editable by the specialist).
export type BuilderItem = {
  exercise_id: string;
  name: string;
  level: number;
  total_series: number;
  total_reps: number;
  rest_time_seconds: number;
};

const LEVELS = [1, 2, 3].map((n) => ({ value: String(n), label: `Nivel ${n}` }));

type Props = {
  item: BuilderItem;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (changes: Partial<BuilderItem>) => void;
};

// Collapsed: one line with "series × repetitions". Expanded: every value is editable.
export default function RoutineExerciseCard({ item, expanded, onToggle, onRemove, onChange }: Props) {
  const { type } = useDensity();

  if (!expanded) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.total_series} por ${item.total_reps}. Editar`}
        activeOpacity={0.8}
        onPress={onToggle}
        style={styles.collapsed}
      >
        <Text style={[type.bodyStrong, styles.name]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[type.secondary, styles.summary]}>
          {item.total_series} × {item.total_reps}
        </Text>
        <Icon mdi="chevron-right" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[type.bodyStrong, styles.name]}>{item.name}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${item.name}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onRemove}
        >
          <Icon mdi="trash-can-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <FormField label="Nivel">
        <ChipGroup
          options={LEVELS}
          value={String(item.level)}
          onChange={(level) => onChange({ level: Number(level) })}
        />
      </FormField>
      <Stepper
        label="Series"
        value={item.total_series}
        min={1}
        onChange={(total_series) => onChange({ total_series })}
      />
      <Stepper
        label="Repeticiones"
        value={item.total_reps}
        min={1}
        onChange={(total_reps) => onChange({ total_reps })}
      />
      <Stepper
        label="Descanso (seg)"
        value={item.rest_time_seconds}
        step={5}
        onChange={(rest_time_seconds) => onChange({ rest_time_seconds })}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  collapsed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
  },
  name: {
    flex: 1,
    color: Colors.textPrimary,
  },
  summary: {
    color: Colors.textSecondary,
  },
});
