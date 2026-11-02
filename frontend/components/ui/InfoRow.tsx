import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import type { MdiName } from "./Icon";
import IconBadge from "./IconBadge";
import { useDensity } from "../../hooks/useDensity";

type Props = {
  mdi: MdiName;
  value: string;
  label?: string;
  // `inline` puts the label on the left and the value on the right.
  inline?: boolean;
  highlight?: boolean;
};

export default function InfoRow({ mdi, value, label, inline = false, highlight = false }: Props) {
  const { type } = useDensity();
  return (
    <View style={styles.row}>
      <IconBadge mdi={mdi} size={40} />
      {inline ? (
        <>
          <Text style={[type.body, styles.label]}>{label}</Text>
          <Text style={[type.title2, highlight && styles.highlight]}>{value}</Text>
        </>
      ) : (
        <View style={styles.stack}>
          {label && <Text style={[type.label, styles.secondary]}>{label}</Text>}
          <Text style={type.bodyStrong}>{value}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  stack: {
    flex: 1,
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
  },
  secondary: {
    color: Colors.textSecondary,
  },
  highlight: {
    color: Colors.primary,
  },
});
