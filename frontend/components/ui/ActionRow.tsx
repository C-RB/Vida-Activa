import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon, { MdiName } from "./Icon";
import IconBadge from "./IconBadge";

type Props = {
  mdi: MdiName;
  label: string;
  onPress: () => void;
};

// A tappable row for settings lists; stack several inside a Card.
export default function ActionRow({ mdi, label, onPress }: Props) {
  const { type } = useDensity();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.row}
    >
      <IconBadge mdi={mdi} size={40} />
      <Text style={[type.bodyStrong, styles.label]}>{label}</Text>
      <Icon mdi="chevron-right" size={24} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
  },
});
