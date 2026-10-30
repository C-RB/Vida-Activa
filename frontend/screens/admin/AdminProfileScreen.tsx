import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormDialog from "../../components/ui/FormDialog";
import InfoRow from "../../components/ui/InfoRow";
import SectionTitle from "../../components/ui/SectionTitle";
import StateMessage from "../../components/ui/StateMessage";
import TextField from "../../components/ui/TextField";
import Toast, { ToastMessage } from "../../components/ui/Toast";
import { Colors, Type } from "../../constants/theme";
import { routes } from "../../router/routes";
import { clearAuth } from "../../services/authStore";
import { changePassword, getAdminProfile, updateAdminProfile } from "../../services/profileService";
import { formatLongDate } from "../../utils/dates";

type AdminView = {
  name: string;
  email: string;
  active: boolean;
  phone: string;
  memberSince: string;
};

const EMPTY_ADMIN: AdminView = { name: "", email: "", active: true, phone: "", memberSince: "" };
const EMPTY_PASSWORDS = { current: "", newPass: "", confirmPass: "" };

const memberSince = (iso: string | null): string => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? formatLongDate(date) : "No disponible";
};

export default function AdminProfileScreen() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminView>(EMPTY_ADMIN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORDS);

  useEffect(() => {
    let mounted = true;
    getAdminProfile()
      .then((p) => {
        if (!mounted) return;
        setAdmin({
          name: [p.first_name, p.last_name].filter(Boolean).join(" ").trim(),
          email: p.email,
          active: p.is_active,
          phone: p.phone ?? "",
          memberSince: memberSince(p.created_at),
        });
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const openEdit = () => {
    setEditForm({ name: admin.name, phone: admin.phone });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (saving) return;
    if (!editForm.name.trim()) {
      setToast({ text: "El nombre no puede estar vacío.", tone: "danger" });
      return;
    }
    // A single "full name" field: the first token is the first name, the rest the last name.
    const parts = editForm.name.trim().split(/\s+/);
    const first_name = parts.shift() ?? "";
    try {
      setSaving(true);
      const updated = await updateAdminProfile({
        first_name,
        last_name: parts.join(" "),
        phone: editForm.phone,
      });
      setAdmin((prev) => ({
        ...prev,
        name: [updated.first_name, updated.last_name].filter(Boolean).join(" ").trim(),
        phone: updated.phone ?? "",
      }));
      setEditOpen(false);
      setToast({ text: "Perfil actualizado correctamente.", tone: "success" });
    } catch (e: any) {
      setToast({ text: e?.message ?? "No se pudo actualizar el perfil.", tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (saving) return;
    const { current, newPass, confirmPass } = passwordForm;
    if (!current || !newPass || !confirmPass) {
      setToast({ text: "Complete todos los campos.", tone: "danger" });
      return;
    }
    if (newPass !== confirmPass) {
      setToast({ text: "Las claves nuevas no coinciden.", tone: "danger" });
      return;
    }
    if (newPass.length < 6) {
      setToast({ text: "La clave debe tener al menos 6 caracteres.", tone: "danger" });
      return;
    }
    try {
      setSaving(true);
      await changePassword({ current_password: current, new_password: newPass });
      setPasswordOpen(false);
      setPasswordForm(EMPTY_PASSWORDS);
      setToast({ text: "Clave cambiada con éxito.", tone: "success" });
    } catch (e: any) {
      setToast({ text: e?.message ?? "No se pudo cambiar la clave.", tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.replace(routes.login as any);
  };

  return (
    <Screen
      title="Mi perfil"
      subtitle="Gestione su información personal y su seguridad."
      nav={{ role: "admin", active: "profile" }}
      floating={<Toast message={toast} onHide={() => setToast(null)} />}
    >
      {loading ? (
        <StateMessage loading />
      ) : (
        <>
          <Card>
            <View style={styles.row}>
              <Avatar name={admin.name} size={64} />
              <View style={styles.flex}>
                <Text style={[Type.title2, styles.textPrimary]}>{admin.name}</Text>
                <Text style={[Type.secondary, styles.textSecondary]}>Administrador</Text>
              </View>
            </View>
            <Badge
              label={admin.active ? "Activo" : "Inactivo"}
              tone={admin.active ? "info" : "danger"}
              mdi={admin.active ? "check-circle-outline" : "cancel"}
            />
            <InfoRow mdi="email-outline" label="Correo electrónico" value={admin.email} />
            <InfoRow mdi="phone-outline" label="Teléfono" value={admin.phone || "No establecido"} />
            <InfoRow mdi="calendar-account-outline" label="Miembro desde" value={admin.memberSince} />
          </Card>

          <SectionTitle>Ajustes de cuenta</SectionTitle>
          <Button title="Editar perfil" variant="soft" onPress={openEdit} />
          <Button
            title="Cambiar clave"
            variant="soft"
            onPress={() => setPasswordOpen(true)}
          />
          <Button title="Cerrar sesión" variant="text" onPress={handleLogout} />
        </>
      )}

      <FormDialog
        visible={editOpen}
        title="Editar perfil"
        confirmLabel="Guardar"
        loading={saving}
        onConfirm={handleSaveProfile}
        onCancel={() => setEditOpen(false)}
      >
        <TextField
          label="Nombre completo"
          value={editForm.name}
          onChangeText={(name) => setEditForm({ ...editForm, name })}
          placeholder="Nombre del administrador"
        />
        <TextField label="Correo electrónico (no editable)" value={admin.email} editable={false} />
        <TextField
          label="Teléfono (opcional)"
          value={editForm.phone}
          onChangeText={(phone) => setEditForm({ ...editForm, phone })}
          placeholder="+56 9 1234 5678"
          keyboardType="phone-pad"
        />
      </FormDialog>

      <FormDialog
        visible={passwordOpen}
        title="Cambiar clave"
        confirmLabel="Actualizar"
        loading={saving}
        onConfirm={handleSavePassword}
        onCancel={() => setPasswordOpen(false)}
      >
        <TextField
          label="Clave actual"
          secure
          value={passwordForm.current}
          onChangeText={(current) => setPasswordForm({ ...passwordForm, current })}
          placeholder="••••••••"
          autoCapitalize="none"
        />
        <TextField
          label="Clave nueva"
          secure
          value={passwordForm.newPass}
          onChangeText={(newPass) => setPasswordForm({ ...passwordForm, newPass })}
          placeholder="Mínimo 6 caracteres"
          autoCapitalize="none"
        />
        <TextField
          label="Confirmar clave nueva"
          secure
          value={passwordForm.confirmPass}
          onChangeText={(confirmPass) => setPasswordForm({ ...passwordForm, confirmPass })}
          placeholder="Vuelva a escribirla"
          autoCapitalize="none"
        />
      </FormDialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  textPrimary: {
    color: Colors.textPrimary,
  },
  textSecondary: {
    color: Colors.textSecondary,
  },
});
