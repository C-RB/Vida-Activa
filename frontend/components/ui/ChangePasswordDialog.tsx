import React, { useState } from "react";
import { changePassword } from "../../services/profileService";
import FormDialog from "./FormDialog";
import TextField from "./TextField";
import type { ToastMessage } from "./Toast";

type Props = {
  visible: boolean;
  onClose: () => void;
  // Reports the outcome so the screen can show it in a Toast.
  onResult: (message: ToastMessage) => void;
};

const EMPTY = { current: "", newPass: "", confirmPass: "" };
const MIN_LENGTH = 6;

export default function ChangePasswordDialog({ visible, onClose, onResult }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    const { current, newPass, confirmPass } = form;
    if (!current || !newPass || !confirmPass) {
      onResult({ text: "Complete todos los campos.", tone: "danger" });
      return;
    }
    if (newPass !== confirmPass) {
      onResult({ text: "Las claves nuevas no coinciden.", tone: "danger" });
      return;
    }
    if (newPass.length < MIN_LENGTH) {
      onResult({ text: `La clave debe tener al menos ${MIN_LENGTH} caracteres.`, tone: "danger" });
      return;
    }
    try {
      setSaving(true);
      await changePassword({ current_password: current, new_password: newPass });
      setForm(EMPTY);
      onClose();
      onResult({ text: "Clave cambiada con éxito.", tone: "success" });
    } catch (e: any) {
      onResult({ text: e?.message ?? "No se pudo cambiar la clave.", tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      visible={visible}
      title="Cambiar clave"
      confirmLabel="Actualizar"
      loading={saving}
      onConfirm={handleSave}
      onCancel={onClose}
    >
      <TextField
        label="Clave actual"
        secure
        value={form.current}
        onChangeText={(current) => setForm({ ...form, current })}
        placeholder="••••••••"
        autoCapitalize="none"
      />
      <TextField
        label="Clave nueva"
        secure
        value={form.newPass}
        onChangeText={(newPass) => setForm({ ...form, newPass })}
        placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
        autoCapitalize="none"
      />
      <TextField
        label="Confirmar clave nueva"
        secure
        value={form.confirmPass}
        onChangeText={(confirmPass) => setForm({ ...form, confirmPass })}
        placeholder="Vuelva a escribirla"
        autoCapitalize="none"
      />
    </FormDialog>
  );
}
