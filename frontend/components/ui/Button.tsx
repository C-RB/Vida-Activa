import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Colors, Radius } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";

// One primary action per screen; "danger" (outline) and "destructive" (filled) only for finishing or irreversible actions.
type Variant = "primary" | "soft" | "outline" | "danger" | "destructive" | "text";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  // Shorter button with smaller text, for use inside cards.
  compact?: boolean;
  style?: ViewStyle;
};

const PALETTE: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: Colors.primary, fg: Colors.onPrimary },
  soft: { bg: Colors.primarySoft, fg: Colors.primary },
  outline: { bg: Colors.surface, fg: Colors.primary, border: Colors.primary },
  danger: { bg: Colors.surface, fg: Colors.danger, border: Colors.danger },
  destructive: { bg: Colors.danger, fg: Colors.onPrimary },
  text: { bg: "transparent", fg: Colors.primary },
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  compact = false,
  style,
}: Props) {
  const { type, control } = useDensity();
  const c = PALETTE[variant];
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          height: compact ? 48 : control,
          backgroundColor: c.bg,
          borderColor: c.border ?? "transparent",
          borderWidth: c.border ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <Text style={[compact ? type.bodyStrong : type.button, { color: c.fg }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.button,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
