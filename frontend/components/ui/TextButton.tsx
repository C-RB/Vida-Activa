import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";

type Props = {
  title: string;
  onPress: () => void;
};

export default function TextButton({ title, onPress }: Props) {
  const { type } = useDensity();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={[type.bodyStrong, { color: Colors.primary }]}>{title}</Text>
    </TouchableOpacity>
  );
}
