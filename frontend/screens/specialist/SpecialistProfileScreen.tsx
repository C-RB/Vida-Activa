import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../../components/layout/Screen";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ContactRow from "../../components/ui/ContactRow";
import StateMessage from "../../components/ui/StateMessage";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import { routes } from "../../router/routes";
import { clearAuth } from "../../services/authStore";
import { getSpecialistProfile, SpecialistProfile } from "../../services/profileService";
import { getDashboard } from "../../services/specialistService";

export default function SpecialistProfileScreen() {
  const router = useRouter();
  const { type } = useDensity();

  const [profile, setProfile] = useState<SpecialistProfile | null>(null);
  const [patients, setPatients] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);


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
    <Screen title="Mi perfil" nav={{ role: "specialist", active: "profile" }}>
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

          <Button title="Cerrar sesión" variant="destructive" onPress={handleLogout} />
        </>
      )}
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
