import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import SurveyQuestion, { SurveyOption } from "../../components/survey/SurveyQuestion";
import Button from "../../components/ui/Button";
import StateMessage from "../../components/ui/StateMessage";
import TextField from "../../components/ui/TextField";
import { getSession } from "../../services/authStore";
import { createSession } from "../../services/sessionService";
import { submitPreSurvey } from "../../services/surveyService";

const MOOD: SurveyOption<number>[] = [
  { value: 5, label: "Muy bien", emoji: "😄" },
  { value: 4, label: "Bien", emoji: "🙂" },
  { value: 3, label: "Regular", emoji: "😐" },
  { value: 2, label: "Mal", emoji: "🙁" },
  { value: 1, label: "Muy mal", emoji: "😖" },
];

// The backend scales for pain and fatigue go from 1 to 10; alerts fire above 7.
const PAIN: SurveyOption<number>[] = [
  { value: 1, label: "Ningún dolor", emoji: "😊" },
  { value: 3, label: "Poco dolor", emoji: "🙂" },
  { value: 5, label: "Dolor moderado", emoji: "😐" },
  { value: 8, label: "Mucho dolor", emoji: "🙁" },
  { value: 10, label: "Dolor muy fuerte", emoji: "😣" },
];

const FATIGUE: SurveyOption<number>[] = [
  { value: 1, label: "Nada de cansancio", emoji: "😄" },
  { value: 3, label: "Poco cansancio", emoji: "🙂" },
  { value: 5, label: "Cansancio moderado", emoji: "😐" },
  { value: 8, label: "Mucho cansancio", emoji: "😩" },
  { value: 10, label: "Agotamiento total", emoji: "😴" },
];

const STEPS = 3;

export default function PreviousSurveyScreen() {
  const router = useRouter();
  // routineId comes from PatientHome as a query param; patientId from the logged-in user in authStore.
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const patientId = getSession()?.patient?.id;

  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<number | null>(null);
  const [pain, setPain] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = step === 1 ? mood : step === 2 ? pain : fatigue;

  const handleBack = () => (step > 1 ? setStep(step - 1) : router.back());

  const handleNext = async () => {
    if (step < STEPS) {
      setStep(step + 1);
      return;
    }
    if (!patientId || !routineId || mood == null || pain == null || fatigue == null) {
      setError("Faltan datos para empezar la sesión.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = await createSession(patientId, routineId);
      await submitPreSurvey({
        session_id: session.id,
        mood_level: mood,
        pain_level: pain,
        fatigue_level: fatigue,
        comments: comments.trim() || undefined,
      });
      // Pass the sessionId and the session_exercise ids (ordered by order_index) as CSV through
      // instruction → active-exercise, which resolves seIds[index].
      const seIds = session.session_exercises.map((se) => se.id).join(",");
      router.push(`/instruction?sessionId=${session.id}&index=0&seIds=${seIds}`);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar la encuesta. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Antes de empezar" onBack={handleBack}>
      {step === 1 && (
        <SurveyQuestion
          step={1}
          steps={STEPS}
          question="¿Cómo se siente hoy?"
          hint="Toque la opción que más se parezca."
          options={MOOD}
          value={mood}
          onChange={setMood}
        />
      )}
      {step === 2 && (
        <SurveyQuestion
          step={2}
          steps={STEPS}
          question="¿Cuánto dolor siente hoy?"
          hint="Piense en cualquier parte del cuerpo."
          options={PAIN}
          value={pain}
          onChange={setPain}
        />
      )}
      {step === 3 && (
        <SurveyQuestion
          step={3}
          steps={STEPS}
          question="¿Cuánto cansancio siente hoy?"
          options={FATIGUE}
          value={fatigue}
          onChange={setFatigue}
        >
          <View style={styles.comments}>
            <TextField
              label="¿Algo más que quiera contarnos? (opcional)"
              value={comments}
              onChangeText={setComments}
              placeholder="Escriba aquí"
            />
          </View>
        </SurveyQuestion>
      )}

      {error && <StateMessage error={error} />}
      <Button
        title={step < STEPS ? "Siguiente" : "Empezar ejercicios"}
        loading={loading}
        disabled={answered == null}
        onPress={handleNext}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  comments: {
    marginTop: 8,
  },
});
