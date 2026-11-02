import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";

// Backend day_of_week: 1 = Monday … 7 = Sunday.
const DAYS = [
  { value: 1, letter: "L", name: "Lunes" },
  { value: 2, letter: "M", name: "Martes" },
  { value: 3, letter: "M", name: "Miércoles" },
  { value: 4, letter: "J", name: "Jueves" },
  { value: 5, letter: "V", name: "Viernes" },
  { value: 6, letter: "S", name: "Sábado" },
  { value: 7, letter: "D", name: "Domingo" },
];

type Props = {
  value: number[];
  onChange: (days: number[]) => void;
};

export default function DayPicker({ value, onChange }: Props) {
  const { type } = useDensity();

  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort());

  return (
    <View style={styles.row}>
      {DAYS.map((day) => {
        const selected = value.includes(day.value);
        return (
          <TouchableOpacity
            key={day.value}
            accessibilityRole="button"
            accessibilityLabel={day.name}
            accessibilityState={{ selected }}
            activeOpacity={0.8}
            onPress={() => toggle(day.value)}
            style={[styles.day, selected && styles.daySelected]}
          >
            <Text
              style={[
                type.bodyStrong,
                { color: selected ? Colors.onPrimary : Colors.textPrimary },
              ]}
            >
              {day.letter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  day: {
    width: 40,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  daySelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
