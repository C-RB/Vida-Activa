import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import Icon, { MdiName } from "./Icon";

type Props = {
  mdi: MdiName;
  label: string;
  onPress: () => void;
  danger?: boolean;
  loading?: boolean;
};

export default function IconButton({ mdi, label, onPress, danger = false, loading = false }: Props) {
  const fg = danger ? Colors.danger : Colors.primary;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={loading}
      style={[styles.button, { backgroundColor: danger ? Colors.dangerSoft : Colors.primarySoft }]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : <Icon mdi={mdi} size={22} color={fg} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
