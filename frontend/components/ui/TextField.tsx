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
import { Colors, Radius } from "../../constants/theme";
import Icon, { MdiName } from "./Icon";
import { useDensity } from "../../hooks/useDensity";

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
  | "maxLength"
  | "autoComplete"
  | "importantForAutofill"
> & {
  label?: string;
  icon?: IconName;
  // Fallback for icons the v2 set does not include yet.
  mdi?: MdiName;
  // Adds the show/hide toggle and hides the text by default.
  secure?: boolean;
};

export default function TextField({ label, icon, mdi, secure = false, ...input }: Props) {
  const { type, control } = useDensity();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      {label && <Text style={[type.bodyStrong, styles.label]}>{label}</Text>}
      <View style={[styles.input, { height: control }, focused && styles.inputFocused]}>
        {icon && <Icon name={icon} size={24} />}
        {mdi && <Icon mdi={mdi} size={24} />}
        <TextInput
          {...input}
          style={[type.body, styles.text]}
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
