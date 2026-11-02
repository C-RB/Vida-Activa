import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/theme";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export default function Toggle({ value, onChange, label }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      activeOpacity={0.8}
      onPress={() => onChange(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    padding: 4,
  },
  trackOn: {
    backgroundColor: Colors.primary,
  },
  trackOff: {
    backgroundColor: Colors.border,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  thumbOn: {
    alignSelf: "flex-end",
  },
  thumbOff: {
    alignSelf: "flex-start",
  },
});
