import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon from "../ui/Icon";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const HERO_HEIGHT = 300;
const SHEET_OVERLAP = 32;

// Entry screens: brand hero on top and a white sheet with the form rising over it.
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
        <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
          <Svg style={StyleSheet.absoluteFill} viewBox="0 0 412 300" preserveAspectRatio="xMidYMax slice">
            <Circle cx={340} cy={70} r={90} fill={Colors.surface} opacity={0.55} />
            <Circle cx={60} cy={120} r={46} fill={Colors.surface} opacity={0.4} />
            <Path
              d="M0 210 C70 150 130 150 200 190 C270 230 340 170 412 150 L412 300 L0 300 Z"
              fill={Colors.primary}
              opacity={0.14}
            />
            <Path
              d="M0 250 C90 205 160 215 230 240 C300 265 360 225 412 205 L412 300 L0 300 Z"
              fill={Colors.primary}
              opacity={0.22}
            />
          </Svg>
          <View style={styles.logoBadge}>
            <Icon name="logo" size={64} color={Colors.onPrimary} />
          </View>
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
    backgroundColor: Colors.primarySoft,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    height: HERO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    overflow: "hidden",
  },
  logoBadge: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
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
