import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon, { MdiName } from "./Icon";
import { Colors, Type } from "../../constants/theme";

type Props = {
  label: string;
  selected?: boolean;
  mdi?: MdiName;
  onPress: () => void;
};

export default function Chip({ label, selected = false, mdi, onPress }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {mdi && <Icon mdi={mdi} size={16} color={selected ? Colors.onPrimary : Colors.textPrimary} />}
      <Text style={[Type.label, { color: selected ? Colors.onPrimary : Colors.textPrimary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
