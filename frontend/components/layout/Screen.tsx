import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NavRole } from "../../constants/navigation";
import { Colors, Type } from "../../constants/theme";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";
import BottomNav from "./BottomNav";

type Props = {
  title: string;
  subtitle?: string;
  // Shows the logo and app name above the title.
  brand?: boolean;
  onBack?: () => void;
  nav?: { role: NavRole; active: string };
  // Rendered over the content, above the bottom bar (toast, floating button).
  floating?: React.ReactNode;
  children: React.ReactNode;
};

export default function Screen({ title, subtitle, brand, onBack, nav, floating, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onBack && <IconButton mdi="arrow-left" label="Volver" onPress={onBack} />}
          {brand && (
            <View style={styles.brand}>
              <Icon name="logo" size={40} />
              <Text style={[Type.title2, styles.textPrimary]}>Vida Activa</Text>
            </View>
          )}
          <View style={styles.heading}>
            <Text style={[Type.title1, styles.textPrimary]}>{title}</Text>
            {subtitle && <Text style={[Type.body, styles.textSecondary]}>{subtitle}</Text>}
          </View>
          {children}
        </ScrollView>
        {floating}
      </KeyboardAvoidingView>
      {nav && <BottomNav role={nav.role} active={nav.active} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 112,
    gap: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heading: {
    gap: 4,
  },
  textPrimary: {
    color: Colors.textPrimary,
  },
  textSecondary: {
    color: Colors.textSecondary,
  },
});
