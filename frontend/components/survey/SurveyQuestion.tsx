import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import OptionCard from "../ui/OptionCard";
import ProgressRow from "../ui/ProgressRow";

export type SurveyOption<T> = { value: T; label: string; emoji?: string };

type Props<T> = {
  step: number;
  steps: number;
  question: string;
  hint?: string;
  options: readonly SurveyOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  // Extra content under the options (a follow-up question, a comment box).
  children?: React.ReactNode;
};

// One survey question per screen: progress, the question and large answers.
export default function SurveyQuestion<T extends string | number>({
  step,
  steps,
  question,
  hint,
  options,
  value,
  onChange,
  children,
}: Props<T>) {
  const { type } = useDensity();
  return (
    <View style={styles.wrap}>
      <ProgressRow label={`Pregunta ${step} de ${steps}`} progress={(step / steps) * 100} />
      <View style={styles.heading}>
        <Text style={[type.title1, styles.question]}>{question}</Text>
        {hint && <Text style={[type.body, styles.hint]}>{hint}</Text>}
      </View>
      {options.map((option) => (
        <OptionCard
          key={String(option.value)}
          label={option.label}
          emoji={option.emoji}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  heading: {
    gap: 4,
    marginBottom: 4,
  },
  question: {
    color: Colors.textPrimary,
  },
  hint: {
    color: Colors.textSecondary,
  },
});
