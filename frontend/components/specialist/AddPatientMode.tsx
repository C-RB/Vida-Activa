import React from "react";
import { useRouter } from "expo-router";
import { routes } from "../../router/routes";
import ChipGroup from "../ui/ChipGroup";

type Mode = "new" | "existing";

const OPTIONS = [
  { value: "new", label: "Paciente nuevo", mdi: "account-plus-outline" },
  { value: "existing", label: "Ya registrado", mdi: "account-search-outline" },
] as const;

// Switches between the two ways of adding a patient: registering a new one or finding one that already exists.
export default function AddPatientMode({ active }: { active: Mode }) {
  const router = useRouter();
  return (
    <ChipGroup
      options={OPTIONS}
      value={active}
      onChange={(mode) => {
        if (mode !== active) {
          router.replace((mode === "new" ? routes.createPatient : routes.assignPatient) as any);
        }
      }}
    />
  );
}
