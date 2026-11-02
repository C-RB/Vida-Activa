import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import SurveyQuestion, { SurveyOption } from "../../components/survey/SurveyQuestion";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChipGroup from "../../components/ui/ChipGroup";
import FormField from "../../components/ui/FormField";
import { routes } from "../../router/routes";
import { completeSession } from "../../services/sessionService";
import { submitPostSurvey } from "../../services/surveyService";

const MOOD: SurveyOption<number>[] = [
  { value: 5, label: "Muy bien", emoji: "😄" },
  { value: 4, label: "Bien", emoji: "🙂" },
  { value: 3, label: "Regular", emoji: "😐" },
  { value: 2, label: "Mal", emoji: "🙁" },
  { value: 1, label: "Muy mal", emoji: "😖" },
];

const PAIN: SurveyOption<"no" | "yes">[] = [
  { value: "no", label: "No, me sentí bien", emoji: "😊" },
  { value: "yes", label: "Sí, sentí dolor", emoji: "😖" },
];

const AREAS = ["Hombro", "Espalda", "Cadera", "Rodilla", "Otro"].map((a) => ({ value: a, label: a }));

const STEPS = 2;

export default function PostExerciseSurveyScreen() {
  const router = useRouter();
  // session_id comes from ActiveExercise and is forwarded to the final screen.
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<number | null>(null);
  const [pain, setPain] = useState<"no" | "yes" | null>(null);
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);

  const answered = step === 1 ? mood : pain;

  const goToEnd = () =>
    router.push({
      pathname: routes.exerciseSessionCompleted as any,
      params: { sessionId: sessionId ?? "" },
    });

  const handleNext = async () => {
    if (step < STEPS) {
      setStep(step + 1);
      return;
    }
    if (mood == null || !sessionId) return;
    setLoading(true);
    try {
      await submitPostSurvey({
        session_id: sessionId,
        mood_level: mood,
        pain_area: pain === "yes" ? area || "Otro" : undefined,
      });
      await completeSession(sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      // The session is over either way, so the patient always reaches the last screen.
      goToEnd();
    }
  };

  return (
    <Screen
      title="Después del ejercicio"
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
    >
      {step === 1 && (
        <SurveyQuestion
          step={1}
          steps={STEPS}
          question="¿Cómo se siente ahora?"
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
          question="¿Sintió dolor durante el ejercicio?"
          options={PAIN}
          value={pain}
          onChange={setPain}
        >
          {pain === "yes" && (
            <Card>
              <FormField label="¿Dónde le dolió?">
                <ChipGroup options={AREAS} value={area} onChange={setArea} />
              </FormField>
            </Card>
          )}
        </SurveyQuestion>
      )}

      <Button
        title={step < STEPS ? "Siguiente" : "Terminar"}
        loading={loading}
        disabled={answered == null}
        onPress={handleNext}
      />
    </Screen>
  );
}
