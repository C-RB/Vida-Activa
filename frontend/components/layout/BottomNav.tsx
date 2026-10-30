import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAV, NavRole } from "../../constants/navigation";
import { Colors, Type } from "../../constants/theme";
import Icon from "../ui/Icon";

type Props = {
  role: NavRole;
  active: string;
};

export default function BottomNav({ role, active }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
      {NAV[role].map((item) => {
        const isActive = active === item.key;
        const color = isActive ? Colors.primary : Colors.textSecondary;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
            onPress={() => router.push(item.href as any)}
          >
            <View style={[styles.pill, isActive && styles.pillActive]}>
              {typeof item.icon === "string" ? (
                <Icon name={item.icon} size={26} color={color} />
              ) : (
                <Icon mdi={item.icon.mdi} size={26} color={color} />
              )}
            </View>
            <Text style={[Type.label, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 18,
  },
  pillActive: {
    backgroundColor: Colors.primarySoft,
  },
});
