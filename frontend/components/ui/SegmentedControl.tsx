import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Type } from "../../constants/theme";

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.group}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <TouchableOpacity
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            activeOpacity={0.8}
            onPress={() => onChange(option)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text
              style={[
                Type.bodyStrong,
                { color: selected ? Colors.onPrimary : Colors.textPrimary },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  option: {
    width: 44,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: Colors.primary,
  },
});
