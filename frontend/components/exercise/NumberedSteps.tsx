import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";

export default function NumberedSteps({ steps }: { steps: string[] }) {
  const { type } = useDensity();
  return (
    <View style={styles.list}>
      {steps.map((step, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.badge}>
            <Text style={[type.labelStrong, styles.number]}>{i + 1}</Text>
          </View>
          <Text style={[type.body, styles.text]}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },
  number: {
    color: Colors.primary,
  },
  text: {
    flex: 1,
    color: Colors.textPrimary,
  },
});
