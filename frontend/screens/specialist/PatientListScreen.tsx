import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import PatientRow from "../../components/specialist/PatientRow";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChipGroup from "../../components/ui/ChipGroup";
import FabButton from "../../components/ui/FabButton";
import StateMessage from "../../components/ui/StateMessage";
import TextField from "../../components/ui/TextField";
import { Colors } from "../../constants/theme";
import { routes } from "../../router/routes";
import { getPatients, PatientListItem } from "../../services/patientService";

type Filter = "all" | "alerts";

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "alerts", label: "Con alertas" },
] as const;

// Same RUT with or without dots and hyphen, so "12.345.678-9" finds "12345678-9".
const plain = (text: string) => text.toLowerCase().replace(/[.\-\s]/g, "");

export default function PatientListScreen() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reload on focus so a patient added from the add screen shows up when coming back.
  useFocusEffect(
    useCallback(() => {
      getPatients()
        .then((data) => {
          setPatients(data);
          setError(null);
        })
        .catch((e) => setError(e?.message ?? "No se pudo cargar la lista."))
        .finally(() => setLoading(false));
    }, [])
  );

  const needle = plain(query);
  const visible = patients.filter(
    (p) =>
      (filter === "all" || p.hasAlert) &&
      (needle === "" || plain(p.fullName).includes(needle) || plain(p.rut ?? "").includes(needle))
  );

  const addPatient = () => router.push(routes.createPatient as any);
  const openRecord = (id: string) =>
    router.push({ pathname: routes.medicalRecord as any, params: { patientId: id } });

  return (
    <Screen
      title="Pacientes"
      subtitle={`${patients.length} en seguimiento`}
      nav={{ role: "specialist", active: "patients" }}
      floating={
        <FabButton mdi="plus" label="Agregar paciente" text="Agregar paciente" onPress={addPatient} />
      }
    >
      <TextField mdi="magnify" placeholder="Buscar por nombre o RUT" value={query} onChangeText={setQuery} />
      <ChipGroup options={FILTERS} value={filter} onChange={setFilter} />

      {loading ? (
        <StateMessage loading />
      ) : error ? (
        <StateMessage error={error} />
      ) : patients.length === 0 ? (
        <View style={styles.empty}>
          <StateMessage empty="Aún no tiene pacientes en su lista. Registre uno nuevo o agregue uno que ya exista." />
          <Button title="Agregar paciente" onPress={addPatient} />
        </View>
      ) : visible.length === 0 ? (
        <StateMessage empty="Ningún paciente coincide con la búsqueda." />
      ) : (
        <Card style={styles.list}>
          {visible.map((p, i) => (
            <View key={p.id} style={i > 0 && styles.separator}>
              <PatientRow
                name={p.fullName}
                detail={p.age != null ? `${p.age} años` : undefined}
                reason={p.hasAlert ? (p.alertMessage ?? "Necesita atención") : "Sin alertas"}
                icon={p.hasAlert ? "alertTriangle" : "check"}
                onPress={() => openRecord(p.id)}
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    gap: 16,
  },
  list: {
    gap: 0,
    padding: 0,
    overflow: "hidden",
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
