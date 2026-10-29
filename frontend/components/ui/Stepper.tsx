import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius, Type } from "../../constants/theme";
import Icon from "./Icon";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
};

export default function Stepper({ label, value, onChange, step = 1, min = 0 }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[Type.label, styles.label]}>{label}</Text>
      <View style={styles.box}>
        <TouchableOpacity
          accessibilityLabel={`Disminuir ${label}`}
          onPress={() => onChange(Math.max(min, value - step))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon mdi="minus" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[Type.bodyStrong, styles.value]}>{value}</Text>
        <TouchableOpacity
          accessibilityLabel={`Aumentar ${label}`}
          onPress={() => onChange(value + step)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon mdi="plus" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.input,
  },
  value: {
    minWidth: 28,
    textAlign: "center",
    color: Colors.textPrimary,
  },
});
