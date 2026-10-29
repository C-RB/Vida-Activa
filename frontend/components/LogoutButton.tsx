import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useFonts } from "expo-font";

import { Colors } from "../constants/theme";
type Props = {
  onPress: () => void;
};

export default function LogoutButton({ onPress }: Props) {
    const [fontsLoaded] = useFonts({
        InterRegular: require("../assets/fonts/Inter_400Regular.ttf"),
        InterSemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
    });
    if (!fontsLoaded) return null;

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>Cerrar Sesión</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.danger,
        padding: 10,
        borderRadius: 20,
        marginTop: 5,
        width: 270,
        height: 60,
        marginLeft: 55,
    },
    text: {
        color: Colors.onPrimary,
        fontSize: 20,
        marginLeft: 10,
        fontFamily: 'InterRegular',
    },
});