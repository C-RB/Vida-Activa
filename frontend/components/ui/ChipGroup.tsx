import React from "react";
import { StyleSheet, View } from "react-native";
import Chip from "./Chip";
import type { MdiName } from "./Icon";

type Option<T extends string> = { value: T; label: string; mdi?: MdiName };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T | "";
  onChange: (value: T) => void;
};

export default function ChipGroup<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          mdi={option.mdi}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
