import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";

import { Colors } from "../constants/theme";
interface MoodOptionProps {
    label: string;
    icon: keyof typeof FontAwesome.glyphMap;
    color: string;
    onPress: () => void;
    selected?: boolean;
}

export default function MoodOption({ label, icon, color, onPress, selected }: MoodOptionProps) {
    const [fontsLoaded] = useFonts({
        InterRegular: require("../assets/fonts/Inter_400Regular.ttf"),
        InterSemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
    });
    if (!fontsLoaded) return null;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[
                styles.button,
                { backgroundColor: color },
                selected && styles.selected,
            ]}
            onPress={onPress}
        >
            <View style={styles.iconWrap}>
                <FontAwesome name={icon} size={52} color={Colors.textPrimary} />
            </View>
            <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "30%",
        minHeight: 130,
        marginBottom: 14,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 6,
        borderWidth: 3,
        borderColor: "transparent",
    },
    selected: {
        borderColor: Colors.primary,
        transform: [{ scale: 1.04 }],
    },
    iconWrap: {
        marginBottom: 8,
    },
    label: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontFamily: "InterSemiBold",
        textAlign: "center",
    },
});
