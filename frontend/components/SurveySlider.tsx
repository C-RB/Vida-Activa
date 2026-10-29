import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { useFonts } from "expo-font";

import { Colors } from "../constants/theme";
export default function SurveySlider({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
    const [fontsLoaded] = useFonts({
        InterRegular: require("../assets/fonts/Inter_400Regular.ttf"),
        InterSemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
    });
    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.valueBadge}>
                    <Text style={styles.valueBadgeText}>{value}</Text>
                </View>
            </View>
            <Slider
                style={{ width: "100%", height: 44 }}
                value={value}
                onValueChange={onChange}
                minimumValue={1}
                maximumValue={10}
                step={1}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="rgba(23, 32, 51, 0.25)"
                thumbTintColor={Colors.textPrimary}
            />
            <View style={styles.scale}>
                {Array.from({ length: 10 }, (_, i) => {
                    const n = i + 1;
                    return (
                        <Text key={n} style={[styles.number, n === value && styles.activeNumber]}>
                            {n}
                        </Text>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 14,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontSize: 20,
        fontFamily: "InterSemiBold",
        color: Colors.textPrimary,
        flex: 1,
    },
    valueBadge: {
        backgroundColor: Colors.primary,
        minWidth: 48,
        height: 36,
        borderRadius: 18,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueBadgeText: {
        fontSize: 20,
        fontFamily: 'InterSemiBold',
        color: Colors.onPrimary,
    },
    scale: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    number: {
        fontSize: 16,
        fontFamily: "InterRegular",
        color: 'rgba(23, 32, 51, 0.55)',
    },
    activeNumber: {
        fontSize: 20,
        fontFamily: "InterSemiBold",
        color: Colors.textPrimary,
    },
});
