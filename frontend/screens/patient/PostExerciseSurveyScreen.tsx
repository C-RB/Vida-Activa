import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import MoodOption from "../../components/MoodOption";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFonts } from "expo-font";
import { routes } from "../../router/routes";
import { submitPostSurvey } from "../../services/surveyService";
import { completeSession } from "../../services/sessionService";

import { Colors, GradientColors } from "../../constants/theme";
export default function PostExerciseSurveyScreen() {
    const router = useRouter();
    // session_id viene desde ActiveExercise; lo reenviamos a la pantalla final.
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [fontsLoaded] = useFonts({
        InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
        InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
    });

    if (!fontsLoaded) return null;

    const options: { label: string; icon: keyof typeof FontAwesome.glyphMap; color: string; value: number }[] = [
        { label: "Muy mal", icon: "frown-o", color: Colors.danger, value: 1 },
        { label: "Mal", icon: "meh-o", color: Colors.textMuted, value: 2 },
        { label: "Regular", icon: "meh-o", color: Colors.textMuted, value: 3 },
        { label: "Bien", icon: "smile-o", color: Colors.textSecondary, value: 4 },
        { label: "Muy bien", icon: "smile-o", color: Colors.primary, value: 5 },
    ];

    const handleSubmit = async () => {
        if (!selected || !sessionId) return;
        
        const option = options.find(o => o.label === selected);
        if (!option) return;

        setLoading(true);
        try {
            await submitPostSurvey({
                session_id: sessionId,
                mood_level: option.value,
                comments: undefined,
            });
            await completeSession(sessionId);
            
            router.push({
                pathname: routes.exerciseSessionCompleted as any,
                params: { sessionId: sessionId ?? "" },
            });
        } catch (e) {
            console.error(e);
            // Si falla igual navegamos
            router.push({
                pathname: routes.exerciseSessionCompleted as any,
                params: { sessionId: sessionId ?? "" },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={GradientColors as any} style={styles.container}>
            <View style={styles.bar}>
                <Text style={styles.title}>Encuesta de bienestar</Text>
                <Text style={styles.subtitle}>Cuéntanos cómo te sentiste hoy</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.question}>¿Cómo te sientes después{"\n"}del ejercicio?</Text>

                <Text style={styles.helper}>
                    Toque la cara que mejor describa{"\n"}cómo se siente
                </Text>

                <View style={styles.moodGrid}>
                    {options.map((option) => (
                        <MoodOption
                            key={option.label}
                            label={option.label}
                            icon={option.icon}
                            color={option.color}
                            onPress={() => setSelected(option.label)}
                            selected={selected === option.label}
                        />
                    ))}
                </View>

                {selected && (
                    <View style={styles.selectedCard}>
                        <MaterialCommunityIcons name="check-circle" size={32} color={Colors.textPrimary} />
                        <Text style={styles.selectedText}>
                            Seleccionaste: <Text style={styles.selectedTextBold}>{selected}</Text>
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, (!selected || loading) && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={!selected || loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.onPrimary} size="large" />
                    ) : (
                        <Text style={styles.buttonText}>Siguiente</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bar: {
        backgroundColor: Colors.primary,
        paddingTop: 54,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    title: {
        fontSize: 28,
        fontFamily: 'InterSemiBold',
        color: Colors.onPrimary,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'InterRegular',
        color: Colors.onPrimary,
        marginTop: 6,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 28,
        paddingBottom: 32,
    },
    question: {
        fontSize: 26,
        fontFamily: "InterSemiBold",
        textAlign: "center",
        color: Colors.textPrimary,
        lineHeight: 34,
    },
    helper: {
        fontSize: 18,
        fontFamily: 'InterRegular',
        textAlign: 'center',
        marginTop: 14,
        marginBottom: 24,
        color: Colors.textPrimary,
        lineHeight: 26,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    selectedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 18,
        marginTop: 8,
    },
    selectedText: {
        flex: 1,
        fontSize: 20,
        fontFamily: 'InterRegular',
        color: Colors.textPrimary,
    },
    selectedTextBold: {
        fontFamily: 'InterSemiBold',
    },
    button: {
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        borderRadius: 20,
        marginTop: 28,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: Colors.onPrimary,
        fontFamily: "InterSemiBold",
        fontSize: 28,
    },
});
