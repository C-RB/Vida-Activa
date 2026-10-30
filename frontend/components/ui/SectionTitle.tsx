import React from "react";
import { Text } from "react-native";
import { Colors, Type } from "../../constants/theme";

export default function SectionTitle({ children }: { children: string }) {
  return <Text style={[Type.title2, { color: Colors.textPrimary }]}>{children}</Text>;
}
