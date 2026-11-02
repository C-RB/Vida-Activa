import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Radius } from "../../constants/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    padding: 20,
    gap: 14,
  },
});
