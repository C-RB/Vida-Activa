import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon from "./Icon";

type Props = {
  label: string;
  // An emoji shown before the label.
  emoji?: string;
  selected: boolean;
  onPress: () => void;
};

// A large single-choice answer: emoji, label and a check when chosen.
export default function OptionCard({ label, emoji, selected, onPress }: Props) {
  const { type } = useDensity();
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {emoji && <Text style={[type.title1, styles.emoji]}>{emoji}</Text>}
      <Text style={[type.bodyStrong, styles.label]}>{label}</Text>
      {selected && (
        <View style={styles.check}>
          <Icon name="check" size={16} color={Colors.onPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 18,
  },
  cardSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  emoji: {
    width: 40,
    textAlign: "center",
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
});
