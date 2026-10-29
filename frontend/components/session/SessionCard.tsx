import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Type } from "../../constants/theme";
import type { Session } from "../../services/patientService";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Icon from "../ui/Icon";
import IconBadge from "../ui/IconBadge";
import InfoRow from "../ui/InfoRow";

type Props = {
  session: Session;
  // Tap to reveal the date and duration; otherwise they show under the name.
  expandable?: boolean;
};

export default function SessionCard({ session, expandable = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  const header = (
    <View style={styles.header}>
      <IconBadge mdi="run-fast" />
      <View style={styles.title}>
        <Text style={Type.bodyStrong} numberOfLines={2}>
          {session.name}
        </Text>
        {!expandable && (
          <Text style={[Type.secondary, styles.meta]}>
            {session.date} · {session.duration}
          </Text>
        )}
      </View>
      {session.completed && <Badge label="Completada" tone="info" />}
      {expandable && (
        <Icon mdi={expanded ? "chevron-up" : "chevron-down"} size={28} color={Colors.textPrimary} />
      )}
    </View>
  );

  return (
    <Card>
      {expandable ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((value) => !value)}
        >
          {header}
        </TouchableOpacity>
      ) : (
        header
      )}
      {expandable && expanded && (
        <View>
          <InfoRow mdi="calendar" value={session.date} />
          <InfoRow mdi="clock-outline" value={`Duración: ${session.duration}`} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    flex: 1,
  },
  meta: {
    color: Colors.textSecondary,
  },
});
