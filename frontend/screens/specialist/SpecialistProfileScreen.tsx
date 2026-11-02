import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import ActionRow from "../../components/ui/ActionRow";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChangePasswordDialog from "../../components/ui/ChangePasswordDialog";
import ContactRow from "../../components/ui/ContactRow";
import FormDialog from "../../components/ui/FormDialog";
import StateMessage from "../../components/ui/StateMessage";
import TextField from "../../components/ui/TextField";
import Toast, { ToastMessage } from "../../components/ui/Toast";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import { routes } from "../../router/routes";
import { clearAuth } from "../../services/authStore";
import { getSpecialistProfile, SpecialistProfile, updateSpecialistProfile } from "../../services/profileService";
import { getDashboard } from "../../services/specialistService";

export default function SpecialistProfileScreen() {
  const router = useRouter();
  const { type } = useDensity();

  const [profile, setProfile] = useState<SpecialistProfile | null>(null);
  const [patients, setPatients] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "", phone: "" });


  useEffect(() => {
    let mounted = true;
    Promise.all([
      getSpecialistProfile().catch(() => null),
      getDashboard()
        .then((d) => d.stats.total_patients)
        .catch(() => null),
    ])
      .then(([p, count]) => {
        if (!mounted) return;
        setProfile(p);
        setPatients(count);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const openEdit = () => {
    setForm({
      name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim(),
      specialty: profile?.specialty ?? "",
      phone: profile?.phone ?? "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      setToast({ text: "El nombre no puede estar vacío.", tone: "danger" });
      return;
    }
    // A single "full name" field: the first token is the first name, the rest the last name.
    const parts = form.name.trim().split(/\s+/);
    const first_name = parts.shift() ?? "";
    try {
      setSaving(true);
      setProfile(
        await updateSpecialistProfile({
          first_name,
          last_name: parts.join(" "),
          specialty: form.specialty.trim(),
          phone: form.phone.trim(),
        })
      );
      setEditOpen(false);
      setToast({ text: "Perfil actualizado correctamente.", tone: "success" });
    } catch (e: any) {
      setToast({ text: e?.message ?? "No se pudo actualizar el perfil.", tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.replace(routes.login as any);
  };

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  const summary = [
    profile?.specialty,
    patients != null ? `${patients} ${patients === 1 ? "paciente" : "pacientes"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Screen
      title="Mi perfil"
      nav={{ role: "specialist", active: "profile" }}
      floating={<Toast message={toast} onHide={() => setToast(null)} />}
    >
      {loading ? (
        <StateMessage loading />
      ) : !profile ? (
        <StateMessage error="No se pudo cargar su perfil." />
      ) : (
        <>
          <Card style={styles.header}>
            <Avatar name={fullName} size={60} />
            <View style={styles.flex}>
              <Text style={[type.title2, styles.textPrimary]}>{fullName}</Text>
              {summary !== "" && (
                <Text style={[type.secondary, styles.textSecondary]}>{summary}</Text>
              )}
            </View>
          </Card>

          <Card>
            <ContactRow mdi="email-outline" text={profile.email} />
            <ContactRow mdi="phone-outline" text={profile.phone || "Teléfono no establecido"} />
            <ContactRow
              mdi="card-account-details-outline"
              text={profile.rut || "RUT no establecido"}
            />
          </Card>

          <Card style={styles.list}>
            <ActionRow mdi="pencil-outline" label="Editar perfil" onPress={openEdit} />
            <View style={styles.divider} />
            <ActionRow
              mdi="lock-outline"
              label="Cambiar clave"
              onPress={() => setPasswordOpen(true)}
            />
          </Card>

          <Button title="Cerrar sesión" variant="destructive" onPress={handleLogout} />
        </>
      )}

      <FormDialog
        visible={editOpen}
        title="Editar perfil"
        confirmLabel="Guardar"
        loading={saving}
        onConfirm={handleSave}
        onCancel={() => setEditOpen(false)}
      >
        <TextField
          label="Nombre completo"
          value={form.name}
          onChangeText={(name) => setForm({ ...form, name })}
          placeholder="Su nombre"
        />
        <TextField
          label="Especialidad"
          value={form.specialty}
          onChangeText={(specialty) => setForm({ ...form, specialty })}
          placeholder="Ej. Kinesiología"
        />
        <TextField
          label="Teléfono"
          value={form.phone}
          onChangeText={(phone) => setForm({ ...form, phone })}
          placeholder="+56 9 1234 5678"
          keyboardType="phone-pad"
        />
        <TextField label="Correo electrónico (no editable)" value={profile?.email ?? ""} editable={false} />
      </FormDialog>

      <ChangePasswordDialog
        visible={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onResult={setToast}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  list: {
    gap: 0,
    padding: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: Colors.border,
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
