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
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon from "../ui/Icon";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

// The sheet rises over the bottom of the hero by this much; the hero reserves it so nothing is covered.
const SHEET_OVERLAP = 28;

// Entry screens: the logo on top and a white sheet with the form rising from below.
export default function AuthScreen({ title, subtitle, children }: Props) {
  const { type } = useDensity();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 32 }]}>
          <Icon name="logo" size={80} />
          <Text style={[type.title2, styles.brand]}>Vida Activa</Text>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.handle} />
          <View style={styles.heading}>
            <Text style={[type.title1, styles.title]}>{title}</Text>
            <Text style={[type.body, styles.subtitle]}>{subtitle}</Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: "center",
    gap: 12,
    paddingBottom: SHEET_OVERLAP + 24,
  },
  brand: {
    color: Colors.primary,
  },
  sheet: {
    flexGrow: 1,
    marginTop: -SHEET_OVERLAP,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 20,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  heading: {
    gap: 6,
    alignItems: "center",
  },
  title: {
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
