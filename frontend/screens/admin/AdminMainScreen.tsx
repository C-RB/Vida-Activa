import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import UserCard from "../../components/admin/UserCard";
import Screen from "../../components/layout/Screen";
import Button from "../../components/ui/Button";
import ChipGroup from "../../components/ui/ChipGroup";
import ProgressRow from "../../components/ui/ProgressRow";
import SectionTitle from "../../components/ui/SectionTitle";
import StatCard from "../../components/ui/StatCard";
import StateMessage from "../../components/ui/StateMessage";
import TextButton from "../../components/ui/TextButton";
import { routes } from "../../router/routes";
import { AdminUser, listUsers, ROLE_LABEL, UserRoleKey } from "../../services/userService";

type Filter = "all" | Exclude<UserRoleKey, "admin">;

const FILTERS = [
  { value: "all", label: "Todos", mdi: "filter-variant" },
  { value: "patient", label: "Paciente" },
  { value: "specialist", label: "Especialista" },
] as const;

export default function AdminMainScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time the dashboard regains focus (e.g. after creating a user).
  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const total = users.length;
  const active = users.filter((u) => u.isActive).length;
  const inactive = total - active;
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

  const visibleUsers = filter === "all" ? users : users.filter((u) => u.role === filter);

  return (
    <Screen
      density="compact"
      brand
      title="Panel principal"
      subtitle="Resumen de actividad y gestión del sistema."
      nav={{ role: "admin", active: "home" }}
    >
      <View style={styles.stats}>
        <StatCard mdi="account-group" value={String(total)} label="Usuarios" />
        <StatCard mdi="account-check" value={String(active)} label="Activos" tone="info" />
        <StatCard
          mdi="account-cancel"
          value={String(inactive)}
          label="Inactivos"
          tone="danger"
          alert={inactive > 0}
        />
      </View>
      <ProgressRow label="Usuarios activos" progress={activePct} value={`${activePct}%`} />

      <SectionTitle>Acciones rápidas</SectionTitle>
      <Button title="Crear usuario" onPress={() => router.push(routes.createUser as any)} />
      <Button
        title="Gestionar usuarios"
        variant="soft"
        onPress={() => router.push(routes.adminUsers as any)}
      />

      <SectionTitle>Resumen de usuarios</SectionTitle>
      <ChipGroup options={FILTERS} value={filter} onChange={setFilter} />

      {loading ? (
        <StateMessage loading />
      ) : visibleUsers.length === 0 ? (
        <StateMessage empty="No hay usuarios para mostrar." />
      ) : (
        <>
          {visibleUsers.map((user) => (
            <UserCard
              key={user.id}
              name={user.fullName}
              detail={ROLE_LABEL[user.role]}
              active={user.isActive}
            />
          ))}
          <View style={styles.center}>
            <TextButton
              title="Ver todos los usuarios"
              onPress={() => router.push(routes.adminUsers as any)}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  center: {
    alignItems: "center",
  },
});
