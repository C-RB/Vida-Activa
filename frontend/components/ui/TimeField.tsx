import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Colors, Radius } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon from "./Icon";

type Props = {
  label: string;
  value: Date;
  onChange: (value: Date) => void;
};

const pad2 = (n: number) => n.toString().padStart(2, "0");

export default function TimeField({ label, value, onChange }: Props) {
  const { type } = useDensity();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[type.secondary, styles.label]}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={styles.input}
      >
        <Icon mdi="clock-outline" size={22} color={Colors.primary} />
        <Text style={[type.title2, styles.value]}>
          {pad2(value.getHours())}:{pad2(value.getMinutes())}
        </Text>
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            // On Android the picker closes itself after the interaction.
            if (Platform.OS !== "ios") setOpen(false);
            if (event.type === "set" && date) onChange(date);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: Colors.textSecondary,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.input,
  },
  value: {
    color: Colors.textPrimary,
  },
});
