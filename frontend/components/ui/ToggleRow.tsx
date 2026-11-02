import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Toggle from "./Toggle";

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function ToggleRow({ label, value, onChange }: Props) {
  const { type } = useDensity();
  return (
    <View style={styles.row}>
      <Text style={[type.body, styles.label]}>{label}</Text>
      <Toggle label={label} value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
  },
});
