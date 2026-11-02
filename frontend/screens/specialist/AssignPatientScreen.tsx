import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import AddPatientMode from "../../components/specialist/AddPatientMode";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InfoRow from "../../components/ui/InfoRow";
import StateMessage from "../../components/ui/StateMessage";
import TextField from "../../components/ui/TextField";
import Toast, { ToastMessage } from "../../components/ui/Toast";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import { routes } from "../../router/routes";
import { assignPatientToSpecialist, getPatientByRut, Patient } from "../../services/patientService";
import { formatRut } from "../../utils/rut";

const BACK_DELAY_MS = 1200;

// Adds an existing patient (created by an admin) to the specialist's list: look it up by RUT, check who it is,
// confirm. Contact data and history only appear once the patient is in the list.
export default function AssignPatientScreen() {
  const { type } = useDensity();
  const router = useRouter();
  const [rut, setRut] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleRutChange = (text: string) => {
    setRut(formatRut(text));
    // A new RUT invalidates the previous result.
    setPatient(null);
    setError(null);
  };

  const handleSearch = async () => {
    if (!rut.trim()) {
      setError("Ingrese el RUT del paciente.");
      return;
    }
    setSearching(true);
    setPatient(null);
    setError(null);
    try {
      setPatient(await getPatientByRut(rut));
    } catch (e: any) {
      setError(e?.message ?? "No se pudo buscar al paciente.");
    } finally {
      setSearching(false);
    }
  };

  const handleAssign = async () => {
    if (!patient) return;
    setAssigning(true);
    try {
      await assignPatientToSpecialist(patient.rut);
      setPatient({ ...patient, assigned: true });
      setToast({ text: "Paciente agregado a su lista.", tone: "success" });
      setTimeout(() => router.back(), BACK_DELAY_MS);
    } catch (e: any) {
      setToast({ text: e?.message ?? "No se pudo agregar al paciente.", tone: "danger" });
    } finally {
      setAssigning(false);
    }
  };

  const openRecord = () =>
    patient && router.push({ pathname: routes.medicalRecord as any, params: { patientId: patient.id } });

  return (
    <Screen
      title="Agregar paciente"
      subtitle="Busque por RUT a un paciente que ya esté registrado y agréguelo a su lista."
      onBack={() => router.back()}
      floating={<Toast message={toast} onHide={() => setToast(null)} />}
    >
      <AddPatientMode active="existing" />

      <TextField
        label="RUT del paciente"
        value={rut}
        onChangeText={handleRutChange}
        placeholder="Ej. 12.345.678-9"
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
        // visible-password on Android turns off the suggestion bar (which inserted repeated digits) and allows 'K'.
        keyboardType={Platform.OS === "android" ? "visible-password" : "default"}
        maxLength={12}
        editable={!searching}
      />
      <Button title="Buscar paciente" loading={searching} onPress={handleSearch} />

      {error && <StateMessage error={error} />}

      {patient && (
        <Card>
          <View style={styles.row}>
            <Avatar name={patient.fullName} size={56} />
            <View style={styles.flex}>
              <Text style={[type.title2, styles.name]}>{patient.fullName}</Text>
              <Text style={[type.secondary, styles.secondary]}>{patient.rut}</Text>
            </View>
          </View>
          <InfoRow mdi="calendar-outline" label="Edad" value={patient.age ? `${patient.age} años` : "—"} />
          <InfoRow mdi="gender-male-female" label="Género" value={patient.gender || "—"} />

          {patient.assigned ? (
            <>
              <Badge label="Ya está en su lista" tone="info" mdi="check-circle-outline" />
              <Button title="Ver ficha" variant="soft" onPress={openRecord} />
            </>
          ) : (
            <>
              <Button title="Agregar a mi lista" loading={assigning} onPress={handleAssign} />
              <Text style={[type.secondary, styles.secondary]}>
                Los datos de contacto y el historial se verán cuando el paciente esté en su lista.
              </Text>
            </>
          )}
        </Card>
      )}
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
  name: {
    color: Colors.textPrimary,
  },
  secondary: {
    color: Colors.textSecondary,
  },
});
