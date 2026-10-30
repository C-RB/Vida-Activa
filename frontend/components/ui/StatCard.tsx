import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Type } from "../../constants/theme";
import type { MdiName } from "./Icon";
import IconBadge, { Tone } from "./IconBadge";

type Props = {
  mdi: MdiName;
  value: string;
  label: string;
  tone?: Tone;
  // Shows a red dot, for values that need attention.
  alert?: boolean;
};

export default function StatCard({ mdi, value, label, tone = "primary", alert = false }: Props) {
  return (
    <View style={styles.card}>
      {alert && <View style={styles.dot} />}
      <IconBadge mdi={mdi} tone={tone} size={44} />
      <Text style={[Type.title1, styles.value]}>{value}</Text>
      <Text style={[Type.secondary, styles.label]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    gap: 6,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
  },
  dot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
  },
  value: {
    color: Colors.textPrimary,
  },
  label: {
    color: Colors.textSecondary,
  },
});
