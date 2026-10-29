import React, { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/theme";
import Icon from "./Icon";

export type Tone = "primary" | "info" | "warning" | "danger";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: Colors.primarySoft, fg: Colors.primary },
  info: { bg: Colors.infoSoft, fg: Colors.info },
  warning: { bg: Colors.warningSoft, fg: Colors.warning },
  danger: { bg: Colors.dangerSoft, fg: Colors.danger },
};

type IconProps = ComponentProps<typeof Icon>;

type Props = {
  size?: number;
  tone?: Tone;
} & ({ name: NonNullable<IconProps["name"]> } | { mdi: NonNullable<IconProps["mdi"]> });

export default function IconBadge({ size = 48, tone = "primary", ...icon }: Props) {
  const { bg, fg } = TONES[tone];
  return (
    <View
      style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}
    >
      <Icon {...(icon as IconProps)} size={Math.round(size * 0.5)} color={fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
});
