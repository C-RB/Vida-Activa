import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";

type Props = {
  label: string;
  // 0–100
  progress: number;
  value?: string;
  // Small text under the bar.
  caption?: string;
};

export default function ProgressRow({ label, progress, value, caption }: Props) {
  const { type } = useDensity();
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[type.secondary, styles.label]}>{label}</Text>
        {value !== undefined && <Text style={type.bodyStrong}>{value}</Text>}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
      </View>
      {caption && <Text style={[type.secondary, styles.label]}>{caption}</Text>}
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
    backgroundColor: Colors.primarySoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
