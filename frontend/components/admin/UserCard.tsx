import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { useDensity } from "../../hooks/useDensity";

type Props = {
  name: string;
  detail: string;
  active: boolean;
  // Action buttons shown under the user data.
  children?: React.ReactNode;
};

export default function UserCard({ name, detail, active, children }: Props) {
  const { type } = useDensity();
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Avatar name={name} size={48} />
        <View style={styles.info}>
          <Text style={[type.bodyStrong, styles.name]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[type.secondary, styles.detail]} numberOfLines={1}>
            {detail}
          </Text>
        </View>
        <Badge
          label={active ? "Activo" : "Inactivo"}
          tone={active ? "info" : "danger"}
          mdi={active ? "check-circle-outline" : "cancel"}
        />
      </View>
      {children && <View style={styles.actions}>{children}</View>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
  },
  detail: {
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
