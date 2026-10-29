import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";
import Card from "./Card";

type Props = {
  title: string;
  children: React.ReactNode;
  // Number of the step shown before the title.
  step?: number;
};

export default function SectionCard({ title, children, step }: Props) {
  return (
    <Card>
      <View style={styles.header}>
        {step !== undefined && (
          <View style={styles.badge}>
            <Text style={[Type.label, { color: Colors.onPrimary }]}>{step}</Text>
          </View>
        )}
        <Text style={[Type.bodyStrong, styles.title]}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
  },
});
