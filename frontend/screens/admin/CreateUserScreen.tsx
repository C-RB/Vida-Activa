import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChipGroup from "../../components/ui/ChipGroup";
import FormField from "../../components/ui/FormField";
import TextButton from "../../components/ui/TextButton";
import TextField from "../../components/ui/TextField";
import Toast, { ToastMessage } from "../../components/ui/Toast";
import { createUserApi, CreateUserPayload } from "../../services/userService";
import { formatRut } from "../../utils/rut";

type Role = "patient" | "specialist";

const ROLES = [
  { value: "patient", label: "Paciente", mdi: "account-outline" },
  { value: "specialist", label: "Especialista", mdi: "medical-bag" },
] as const;

const GENDERS = ["Masculino", "Femenino", "Otro"].map((g) => ({ value: g, label: g }));

export default function CreateUserScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("patient");

  const [rut, setRut] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [specialty, setSpecialty] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  // The optional fields start collapsed (progressive disclosure).
  const [showMore, setShowMore] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Atención", "Ingrese el nombre y el correo.");
      return;
    }
    if (age.trim() && Number.isNaN(Number(age))) {
      Alert.alert("Atención", "La edad debe ser un número.");
      return;
    }

    // Only fields with a value are sent; empty ones stay NULL in the backend.
    const payload: CreateUserPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      rut: rut.trim() || undefined,
      phone: phone.trim() || undefined,
    };
    if (role === "patient") {
      payload.age = age.trim() ? Number(age) : undefined;
      payload.gender = gender || undefined;
      payload.address = address.trim() || undefined;
    } else {
      payload.specialty = specialty.trim() || undefined;
    }

    setLoading(true);
    try {
      const created = await createUserApi(payload);
      setToast({ text: "Usuario guardado correctamente.", tone: "success" });

      // The temporary password is shown once so the admin can hand it over.
      if (created.temp_password) {
        setTimeout(() => {
          Alert.alert(
            "Usuario creado",
            `Clave temporal para ${created.email}:\n\n${created.temp_password}\n\nCompártala con el usuario; no se volverá a mostrar.`,
            [{ text: "Entendido", onPress: () => router.back() }]
          );
        }, 600);
      } else {
        setTimeout(() => router.back(), 3000);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "No se pudo crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title="Crear usuario"
      subtitle="Registre un nuevo perfil en el sistema."
      onBack={() => router.back()}
      floating={<Toast message={toast} onHide={() => setToast(null)} />}
    >
      <Card>
        <TextField
          label="Nombre completo"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Ej. Ana María Silva"
        />
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="ana.silva@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FormField label="Rol del usuario">
          <ChipGroup options={ROLES} value={role} onChange={setRole} />
        </FormField>
        <TextField
          label="RUT"
          value={rut}
          onChangeText={(text) => setRut(formatRut(text))}
          placeholder="Ej. 12.345.678-9"
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          importantForAutofill="no"
          keyboardType={Platform.OS === "android" ? "visible-password" : "default"}
          maxLength={12}
        />

        <TextButton
          title={showMore ? "Ocultar datos adicionales" : "Agregar datos adicionales (opcional)"}
          onPress={() => setShowMore((v) => !v)}
        />

        {showMore && (
          <>
            <TextField
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              placeholder="Ej. +56912345678"
              keyboardType="phone-pad"
            />
            {role === "patient" ? (
              <>
                <TextField
                  label="Edad"
                  value={age}
                  onChangeText={(text) => setAge(text.replace(/\D/g, ""))}
                  placeholder="Ej. 72"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <FormField label="Género">
                  <ChipGroup options={GENDERS} value={gender} onChange={setGender} />
                </FormField>
                <TextField
                  label="Dirección"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Ej. Av. Ficticia 123, Temuco"
                />
              </>
            ) : (
              <TextField
                label="Especialidad"
                value={specialty}
                onChangeText={setSpecialty}
                placeholder="Ej. Kinesiología"
              />
            )}
          </>
        )}
      </Card>

      <Button title="Guardar" loading={loading} onPress={handleSave} />
    </Screen>
  );
}
