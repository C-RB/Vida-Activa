import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import UserCard from "../../components/admin/UserCard";
import Screen from "../../components/layout/Screen";
import ChipGroup from "../../components/ui/ChipGroup";
import SectionTitle from "../../components/ui/SectionTitle";
import StatCard from "../../components/ui/StatCard";
import StateMessage from "../../components/ui/StateMessage";
import TextButton from "../../components/ui/TextButton";
import { routes } from "../../router/routes";
import { AdminUser, listUsers, ROLE_LABEL, UserRoleKey } from "../../services/userService";

// Role filters list active users, matching the cards; "inactive" lists every deactivated user.
type Filter = "all" | "patient" | "specialist" | "inactive";

const FILTERS = [
  { value: "all", label: "Todos", mdi: "filter-variant" },
  { value: "patient", label: "Paciente" },
  { value: "specialist", label: "Especialista" },
  { value: "inactive", label: "Inactivos" },
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

  const activeOf = (role: UserRoleKey) => users.filter((u) => u.role === role && u.isActive).length;
  const inactive = users.filter((u) => !u.isActive).length;

  const visibleUsers = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "inactive") return !u.isActive;
    return u.role === filter && u.isActive;
  });

  return (
    <Screen
      density="compact"
      brand
      title="Panel principal"
      subtitle="Resumen de actividad y gestión del sistema."
      nav={{ role: "admin", active: "home" }}
    >
      <View style={styles.stats}>
        <StatCard mdi="account-outline" value={String(activeOf("patient"))} label="Pacientes" />
        <StatCard
          mdi="medical-bag"
          value={String(activeOf("specialist"))}
          label="Especialistas"
          tone="info"
        />
        <StatCard
          mdi="shield-account-outline"
          value={String(activeOf("admin"))}
          label="Administradores"
          tone="warning"
        />
        <StatCard
          mdi="account-cancel"
          value={String(inactive)}
          label="Inactivos"
          tone="danger"
          alert={inactive > 0}
        />
      </View>

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
