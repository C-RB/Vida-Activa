import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import BottomNav from "../../components/layout/BottomNav";
import { BannerStyle, Colors, Fonts, GradientColors } from "../../constants/theme";
import { clearAuth } from "../../services/authStore";
import { getSpecialistProfile, SpecialistProfile } from "../../services/profileService";
import InfoRow from "../../components/ui/InfoRow";
import SectionTitle from "../../components/ui/SectionTitle";


const PLACEHOLDER = "No establecido";

export default function SpecialistProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<SpecialistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  useEffect(() => {
    let mounted = true;
    getSpecialistProfile()
      .then((p) => mounted && setProfile(p))
      .catch(() => mounted && setProfile(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (!fontsLoaded) return null;

  const handleLogout = () => {
    clearAuth();
    router.replace("/" as any);
  };

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || PLACEHOLDER;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerSubtitle}>Panel Profesional</Text>
        <Text style={styles.bannerTitle}>Mi Perfil</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.btnTeal} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <MaterialCommunityIcons name="account-circle-outline" size={72} color={Colors.textPrimary} />
            </View>
            <Text style={styles.profileName}>{fullName}</Text>
            <View style={styles.specialtyPill}>
              <MaterialCommunityIcons name="stethoscope" size={14} color={Colors.textOnDark} />
              <Text style={styles.specialtyText}>{profile?.specialty || "Especialista"}</Text>
            </View>
          </View>

          <SectionTitle>Información personal</SectionTitle>
          <View style={styles.infoCard}>
            <InfoRow mdi="email-outline" label="Correo electrónico" value={profile?.email || PLACEHOLDER} />
            <View style={styles.divider} />
            <InfoRow mdi="phone-outline" label="Teléfono" value={profile?.phone || PLACEHOLDER} />
            <View style={styles.divider} />
            <InfoRow mdi="card-account-details-outline" label="RUT" value={profile?.rut || PLACEHOLDER} />
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <MaterialCommunityIcons name="logout" size={20} color={Colors.textOnDark} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <BottomNav role="specialist" active="profile" />
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  banner: { ...BannerStyle },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.bannerSubtitle,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.bannerTitle,
  },

  profileCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.btnTeal,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBgAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  profileMeta: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  specialtyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.btnTeal,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.textOnDark,
  },

  infoCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(23, 32, 51, 0.1)",
    marginVertical: 4,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.btnDanger,
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.textOnDark,
  },
});
