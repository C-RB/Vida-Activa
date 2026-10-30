import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Colors, Type } from "../../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
};

export default function TextButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={[Type.bodyStrong, { color: Colors.primary }]}>{title}</Text>
    </TouchableOpacity>
  );
}
