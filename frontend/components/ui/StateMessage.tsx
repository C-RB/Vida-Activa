import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";

type Props = {
  loading?: boolean;
  error?: string | null;
  empty?: string;
};

// One place for the loading, error and empty states of a list or section.
export default function StateMessage({ loading, error, empty }: Props) {
  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }
  const text = error ?? empty;
  if (!text) return null;
  return (
    <View style={styles.box}>
      <Text style={[Type.body, { color: error ? Colors.danger : Colors.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    paddingVertical: 24,
  },
});
