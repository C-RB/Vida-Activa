import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/theme";

type Props = {
  // Total number of segments and how many are filled.
  total: number;
  current: number;
};

export default function SegmentedProgress({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.segment, i < current && styles.segmentDone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    height: 6,
  },
  segment: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  segmentDone: {
    backgroundColor: Colors.primary,
  },
});
