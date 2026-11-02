import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon, { MdiName } from "./Icon";

type Props = {
  mdi: MdiName;
  text: string;
};

export default function ContactRow({ mdi, text }: Props) {
  const { type } = useDensity();
  return (
    <View style={styles.row}>
      <Icon mdi={mdi} size={22} color={Colors.textSecondary} />
      <Text style={[type.body, styles.text]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    flex: 1,
    color: Colors.textPrimary,
  },
});
