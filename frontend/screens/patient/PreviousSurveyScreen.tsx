import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import SurveySlider from "../../components/SurveySlider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createSession } from "../../services/sessionService";
import { submitPreSurvey } from "../../services/surveyService";
import { getSession } from "../../services/authStore";

import { Colors, GradientColors } from "../../constants/theme";
import Icon from "../../components/ui/Icon";
export default function PreviousSurveyScreen() {
  const router = useRouter();
  // routineId comes from PatientHome as a query param; patientId from the logged-in user in authStore.
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const patientId = getSession()?.patient?.id;

  const [effort, setEffort] = useState(4);
  const [tiredness, setTiredness] = useState(4);
  const [stress, setStress] = useState(4);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  const handleSubmit = async () => {
    if (!patientId || !routineId) {
      console.error("Falta patientId o routineId para crear la sesion");
      return;
    }
    setLoading(true);
    try {
      const session = await createSession(patientId, routineId);
      
      await submitPreSurvey({
        session_id: session.id,
        pain_level: effort,
        fatigue_level: tiredness,
        comments: comments || undefined,
      });

      // Navigate to instructions with the sessionId and the session_exercise ids (ordered by order_index),
      // passed as CSV through instruction → active-exercise, which resolves seIds[index].
      const seIds = session.session_exercises.map((se) => se.id).join(",");
      router.push(`/instruction?sessionId=${session.id}&index=0&seIds=${seIds}`);
    } catch (e) {
      console.error(e);
      // Navigate anyway if this fails
      router.push(`/instruction?index=0`);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={GradientColors as any} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={32} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.title}>
            <Icon name="logo" size={96} />
            <Text style={styles.name}>¿Cómo te sientes?</Text>
            <Text style={styles.subtitle}>
              Antes de empezar, cuentanos como estas hoy
            </Text>
          </View>

          <View style={styles.slider}>
            <SurveySlider label="Nivel de esfuerzo" value={effort} onChange={setEffort} />
            <SurveySlider label="Nivel de cansancio" value={tiredness} onChange={setTiredness} />
            <SurveySlider label="Nivel de estrés" value={stress} onChange={setStress} />

            <View style={{ marginTop: 24 }}>
              <Text style={styles.label}>Otros (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe aquí cómo te sientes..."
                placeholderTextColor="rgba(23, 32, 51, 0.5)"
                multiline
                value={comments}
                onChangeText={setComments}
              />
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} size="large" />
            ) : (
              <Text style={styles.buttonText}>Continuar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 30,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'InterRegular',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 26,
  },
  slider: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 22,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 14,
    backgroundColor: Colors.background,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlign: "left",
    textAlignVertical: "top",
    fontFamily: "InterRegular",
    fontSize: 18,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 20,
    marginHorizontal: 25,
    marginBottom: 20,
    alignSelf: "stretch",
  },
  buttonText: {
    color: Colors.onPrimary,
    fontFamily: "InterSemiBold",
    fontSize: 28,
  },
  backBtn: {
    marginTop: 50,
    marginLeft: 16,
    alignSelf: "flex-start",
    padding: 8,
  },
});
