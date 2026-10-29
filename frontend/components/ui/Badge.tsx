import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";
import Icon, { MdiName } from "./Icon";
import type { Tone } from "./IconBadge";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: Colors.primarySoft, fg: Colors.primary },
  info: { bg: Colors.infoSoft, fg: Colors.info },
  warning: { bg: Colors.warningSoft, fg: Colors.warning },
  danger: { bg: Colors.dangerSoft, fg: Colors.danger },
};

type Props = {
  label: string;
  tone?: Tone;
  mdi?: MdiName;
};

export default function Badge({ label, tone = "primary", mdi }: Props) {
  const { bg, fg } = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {mdi && <Icon mdi={mdi} size={16} color={fg} />}
      <Text style={[Type.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
});
