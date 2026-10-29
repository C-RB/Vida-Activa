import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Type } from "../../constants/theme";
import type { Exercise } from "../../services/exerciseService";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import IconButton from "../ui/IconButton";

type Props = {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
};

export default function ExerciseCard({ exercise, onAdd }: Props) {
  return (
    <Card>
      <View style={styles.top}>
        <IconBadge mdi="run" size={44} />
        <View style={styles.info}>
          <Text style={Type.bodyStrong}>{exercise.name}</Text>
          {exercise.description ? (
            <Text style={[Type.secondary, styles.description]}>{exercise.description}</Text>
          ) : null}
        </View>
        <IconButton mdi="plus" label={`Añadir ${exercise.name}`} onPress={() => onAdd(exercise)} />
      </View>
      {exercise.multimedia_url ? <Badge mdi="play-circle-outline" label="Video disponible" /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  info: {
    flex: 1,
  },
  description: {
    color: Colors.textSecondary,
  },
});
