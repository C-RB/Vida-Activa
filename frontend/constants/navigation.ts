import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { IconName } from "./icons";
import { routes } from "../router/routes";

type MdiName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type NavItem = {
  key: string;
  label: string;
  icon: IconName | { mdi: MdiName };
  href: string;
};

export type NavRole = "patient" | "specialist" | "admin";

export const NAV: Record<NavRole, NavItem[]> = {
  patient: [
    { key: "home", label: "Inicio", icon: "home", href: routes.patientHome },
    { key: "history", label: "Mi avance", icon: "chart", href: routes.patientHistory },
    { key: "profile", label: "Perfil", icon: "user", href: routes.patientProfile },
  ],
  specialist: [
    { key: "home", label: "Inicio", icon: { mdi: "home-outline" }, href: routes.specialistHome },
    { key: "calendar", label: "Agenda", icon: { mdi: "calendar-month-outline" }, href: routes.specialistCalendar },
    { key: "patients", label: "Pacientes", icon: { mdi: "account-group-outline" }, href: routes.patientList },
    { key: "profile", label: "Perfil", icon: { mdi: "account-outline" }, href: routes.specialistProfile },
  ],
  admin: [
    { key: "home", label: "Inicio", icon: { mdi: "home-outline" }, href: routes.adminMain },
    { key: "users", label: "Usuarios", icon: { mdi: "account-group-outline" }, href: routes.adminUsers },
    { key: "profile", label: "Perfil", icon: { mdi: "account-outline" }, href: routes.adminProfile },
  ],
};
