import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import type { IconName } from "../../constants/icons";
import { Colors, Radius, Type } from "../../constants/theme";
import Icon from "./Icon";

type Props = Pick<
  TextInputProps,
  | "value"
  | "onChangeText"
  | "placeholder"
  | "keyboardType"
  | "autoCapitalize"
  | "autoCorrect"
  | "textContentType"
  | "editable"
> & {
  label: string;
  icon?: IconName;
  // Adds the show/hide toggle and hides the text by default.
  secure?: boolean;
};

export default function TextField({ label, icon, secure = false, ...input }: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[Type.bodyStrong, styles.label]}>{label}</Text>
      <View style={[styles.input, focused && styles.inputFocused]}>
        {icon && <Icon name={icon} size={24} />}
        <TextInput
          {...input}
          style={[Type.body, styles.text]}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={secure && !visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setVisible((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Ocultar clave" : "Mostrar clave"}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="eye" size={24} color={visible ? Colors.primary : undefined} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: Colors.textPrimary,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.input,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  text: {
    flex: 1,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
});
