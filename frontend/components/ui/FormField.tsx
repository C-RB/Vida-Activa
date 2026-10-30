import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";

type Props = {
  label: string;
  children: React.ReactNode;
};

// Label for controls that have none of their own (chips, selectors).
export default function FormField({ label, children }: Props) {
  return (
    <View style={styles.field}>
      <Text style={[Type.bodyStrong, styles.label]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: Colors.textPrimary,
  },
});
