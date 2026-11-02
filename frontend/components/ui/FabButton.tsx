import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon, { MdiName } from "./Icon";

type Props = {
  mdi: MdiName;
  label: string;
  onPress: () => void;
  // Shows a text next to the icon and turns the button into a pill.
  text?: string;
};

// Floating action; place it inside `Screen`'s `floating` slot.
export default function FabButton({ mdi, label, onPress, text }: Props) {
  const { type } = useDensity();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.fab, text ? styles.pill : styles.round]}
    >
      <Icon mdi={mdi} size={text ? 22 : 28} color={Colors.onPrimary} />
      {text && <Text style={[type.button, styles.text]}>{text}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  round: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  pill: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 26,
  },
  text: {
    color: Colors.onPrimary,
  },
});
