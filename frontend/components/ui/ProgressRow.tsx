import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";

type Props = {
  label: string;
  // 0–100
  progress: number;
  value?: string;
};

export default function ProgressRow({ label, progress, value }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[Type.secondary, styles.label]}>{label}</Text>
        {value !== undefined && <Text style={Type.bodyStrong}>{value}</Text>}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: Colors.textSecondary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
