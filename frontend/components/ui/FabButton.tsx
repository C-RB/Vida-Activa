import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import Icon, { MdiName } from "./Icon";

type Props = {
  mdi: MdiName;
  label: string;
  onPress: () => void;
};

// Floating action; place it inside `Screen`'s `floating` slot.
export default function FabButton({ mdi, label, onPress }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.fab}
    >
      <Icon mdi={mdi} size={28} color={Colors.onPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
