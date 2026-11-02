import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { IconName } from "../../constants/icons";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";

type Props = {
  name: string;
  // Shown next to the name, e.g. "72 años".
  detail?: string;
  reason: string;
  icon: IconName;
  onPress: () => void;
};

// A patient with a short status line; stack several inside a Card.
export default function PatientRow({ name, detail, reason, icon, onPress }: Props) {
  const { type } = useDensity();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${reason}`}
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.row}
    >
      <Avatar name={name} size={44} />
      <View style={styles.info}>
        <Text style={[type.bodyStrong, styles.name]} numberOfLines={1}>
          {detail ? `${name} · ${detail}` : name}
        </Text>
        <View style={styles.reason}>
          <Icon name={icon} size={18} />
          <Text style={[type.secondary, styles.reasonText]} numberOfLines={2}>
            {reason}
          </Text>
        </View>
      </View>
      <Icon mdi="chevron-right" size={22} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: Colors.textPrimary,
  },
  reason: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reasonText: {
    flex: 1,
    color: Colors.textSecondary,
  },
});
