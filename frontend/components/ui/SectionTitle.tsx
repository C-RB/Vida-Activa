import React from "react";
import { Text } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";

export default function SectionTitle({ children }: { children: string }) {
  const { type } = useDensity();
  return <Text style={[type.title2, { color: Colors.textPrimary }]}>{children}</Text>;
}
