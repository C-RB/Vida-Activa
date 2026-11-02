import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import AddPatientMode from "../../components/specialist/AddPatientMode";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChipGroup from "../../components/ui/ChipGroup";
import FormField from "../../components/ui/FormField";
import StateMessage from "../../components/ui/StateMessage";
import TextButton from "../../components/ui/TextButton";
import TextField from "../../components/ui/TextField";
import { routes } from "../../router/routes";
import { createPatient } from "../../services/patientService";
import { formatRut } from "../../utils/rut";

const GENDERS = ["Masculino", "Femenino", "Otro"].map((g) => ({ value: g, label: g }));

// Registers a brand-new patient. The temporary password is shown once so it can be handed over in person.
export default function CreatePatientScreen() {
  const router = useRouter();
  const [rut, setRut] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  // The optional fields start collapsed (progressive disclosure).
  const [showMore, setShowMore] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A duplicate RUT is not a dead end: the patient exists and can be added by searching their RUT.
  const [duplicateRut, setDuplicateRut] = useState(false);

  const handleSave = async () => {
    setError(null);
    setDuplicateRut(false);
    if (!rut.trim() || !fullName.trim() || !email.trim()) {
      setError("Ingrese el RUT, el nombre y el correo del paciente.");
      return;
    }

    setSaving(true);
    try {
      const created = await createPatient({
        rut: rut.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        age: age.trim() ? Number(age) : undefined,
        gender: gender || undefined,
        address: address.trim() || undefined,
      });
      Alert.alert(
        "Paciente creado",
        `Clave temporal para ${created.email}:\n\n${created.temp_password}\n\nEntréguesela al paciente: no se volverá a mostrar.`,
        [{ text: "Entendido", onPress: () => router.replace(routes.patientList as any) }]
      );
    } catch (e: any) {
      const message = e?.message ?? "No se pudo crear al paciente.";
      setError(message);
      setDuplicateRut(message.includes("RUT"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Agregar paciente"
      subtitle="Regístrelo aquí y quedará en su lista. Le daremos una clave temporal para que se la entregue."
      onBack={() => router.back()}
    >
      <AddPatientMode active="new" />

      <Card>
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
        <TextField
          label="Nombre completo"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Ej. Rosa Pérez Soto"
        />
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="rosa.perez@correo.cl"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Teléfono celular"
          value={phone}
          onChangeText={setPhone}
          placeholder="+56 9 1234 5678"
          keyboardType="phone-pad"
        />

        <TextButton
          title={showMore ? "Ocultar datos adicionales" : "Agregar datos adicionales (opcional)"}
          onPress={() => setShowMore((v) => !v)}
        />

        {showMore && (
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
              placeholder="Ej. Av. Alemania 123, Temuco"
            />
          </>
        )}
      </Card>

      {error && <StateMessage error={error} />}
      {duplicateRut && (
        <Button
          title="Buscar paciente por RUT"
          variant="soft"
          onPress={() => router.replace(routes.assignPatient as any)}
        />
      )}

      <Button title="Guardar paciente" loading={saving} onPress={handleSave} />
    </Screen>
  );
}
