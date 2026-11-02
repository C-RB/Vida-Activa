import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import UserCard from "../../components/admin/UserCard";
import Screen from "../../components/layout/Screen";
import Badge from "../../components/ui/Badge";
import ChipGroup from "../../components/ui/ChipGroup";
import FabButton from "../../components/ui/FabButton";
import FormDialog from "../../components/ui/FormDialog";
import FormField from "../../components/ui/FormField";
import IconButton from "../../components/ui/IconButton";
import StateMessage from "../../components/ui/StateMessage";
import TextButton from "../../components/ui/TextButton";
import TextField from "../../components/ui/TextField";
import { routes } from "../../router/routes";
import {
  AdminUser,
  listUsers,
  ROLE_LABEL,
  setUserStatus,
  UserRoleKey,
} from "../../services/userService";

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as UserRoleKey[]).map((value) => ({
  value,
  label: ROLE_LABEL[value],
}));

export default function AdminUsersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers({ search }));
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced on the search box.
  useEffect(() => {
    const handle = setTimeout(() => loadUsers(searchQuery), 350);
    return () => clearTimeout(handle);
  }, [searchQuery, loadUsers]);

  // Toggles the status against the backend, then updates the row in place.
  const handleToggleStatus = (user: AdminUser) => {
    const action = user.isActive ? "desactivar" : "activar";
    Alert.alert("Confirmar acción", `¿Está seguro de que desea ${action} a ${user.fullName}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        style: user.isActive ? "destructive" : "default",
        onPress: async () => {
          setTogglingId(user.id);
          try {
            const updated = await setUserStatus(user.id, !user.isActive);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "No se pudo actualizar el estado.");
          } finally {
            setTogglingId(null);
          }
        },
      },
    ]);
  };

  // There is no edit endpoint yet, so edits only change the local list.
  const handleSaveEdit = () => {
    if (editingUser) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    }
    setEditingUser(null);
  };

  return (
    <Screen
      density="compact"
      title="Gestión de usuarios"
      subtitle="Administre los usuarios del sistema, sus roles y estados."
      nav={{ role: "admin", active: "users" }}
      floating={
        <FabButton
          mdi="account-plus"
          label="Crear usuario"
          onPress={() => router.push(routes.createUser as any)}
        />
      }
    >
      <TextField
        mdi="magnify"
        placeholder="Buscar por nombre, correo o rol"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <StateMessage loading />
      ) : error ? (
        <>
          <StateMessage error={error} />
          <View style={styles.center}>
            <TextButton title="Reintentar" onPress={() => loadUsers(searchQuery)} />
          </View>
        </>
      ) : users.length === 0 ? (
        <StateMessage empty="No se encontraron usuarios." />
      ) : (
        users.map((user) => (
          <UserCard key={user.id} name={user.fullName} detail={user.email} active={user.isActive}>
            <Badge
              label={ROLE_LABEL[user.role]}
              tone={user.role === "admin" ? "warning" : "primary"}
              mdi={user.role === "admin" ? "shield-account-outline" : "briefcase-outline"}
            />
            <View style={styles.spacer} />
            <IconButton mdi="pencil-outline" label="Editar" onPress={() => setEditingUser(user)} />
            <IconButton
              mdi={user.isActive ? "cancel" : "check-circle-outline"}
              label={user.isActive ? "Desactivar" : "Activar"}
              danger={user.isActive}
              loading={togglingId === user.id}
              onPress={() => handleToggleStatus(user)}
            />
          </UserCard>
        ))
      )}

      <FormDialog
        visible={editingUser !== null}
        title="Editar usuario"
        confirmLabel="Guardar"
        onConfirm={handleSaveEdit}
        onCancel={() => setEditingUser(null)}
      >
        {editingUser && (
          <>
            <TextField
              label="Nombre completo"
              value={editingUser.fullName}
              onChangeText={(fullName) => setEditingUser({ ...editingUser, fullName })}
              placeholder="Ej. Juan Pérez"
            />
            <TextField
              label="Correo electrónico"
              value={editingUser.email}
              onChangeText={(email) => setEditingUser({ ...editingUser, email })}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField label="Rol del usuario">
              <ChipGroup
                options={ROLE_OPTIONS}
                value={editingUser.role}
                onChange={(role) => setEditingUser({ ...editingUser, role })}
              />
            </FormField>
            <StateMessage empty="Los cambios de perfil son locales por ahora. El estado (activo o inactivo) sí se guarda en el servidor." />
          </>
        )}
      </FormDialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
});
