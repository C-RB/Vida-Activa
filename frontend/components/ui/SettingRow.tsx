import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";
import type { IconName } from "../../constants/icons";
import Icon from "./Icon";

type Props = {
  icon: IconName;
  label: string;
  // Control on the right, e.g. a Toggle or a SegmentedControl.
  children: React.ReactNode;
};

export default function SettingRow({ icon, label, children }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Icon name={icon} size={25} />
      </View>
      <Text style={[Type.bodyStrong, styles.label]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
  },
});
