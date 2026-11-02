import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon from "./Icon";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
};

// Label on the left, minus / value / plus on the right.
export default function Stepper({ label, value, onChange, step = 1, min = 0 }: Props) {
  const { type } = useDensity();
  return (
    <View style={styles.row}>
      <Text style={[type.body, styles.label]}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Disminuir ${label}`}
        activeOpacity={0.7}
        onPress={() => onChange(Math.max(min, value - step))}
        style={[styles.box, styles.button]}
      >
        <Icon mdi="minus" size={22} color={Colors.primary} />
      </TouchableOpacity>
      <View style={[styles.box, styles.value]}>
        <Text style={[type.title2, styles.valueText]}>{value}</Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Aumentar ${label}`}
        activeOpacity={0.7}
        onPress={() => onChange(value + step)}
        style={[styles.box, styles.button]}
      >
        <Icon mdi="plus" size={22} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
  },
  box: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  value: {
    backgroundColor: Colors.background,
  },
  valueText: {
    color: Colors.textPrimary,
  },
});
