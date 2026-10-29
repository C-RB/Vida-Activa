import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useFocusEffect, useRouter } from "expo-router";
import BottomNav from "../../components/layout/BottomNav";
import { listUsers, AdminUser, ROLE_LABEL, UserRoleKey } from "../../services/userService";
import { routes } from "../../router/routes";

import { Colors, GradientColors } from "../../constants/theme";
import Chip from "../../components/ui/Chip";
import SectionTitle from "../../components/ui/SectionTitle";
import StateMessage from "../../components/ui/StateMessage";
// Role filter pills.
const FILTERS: { label: string; role?: UserRoleKey }[] = [
  { label: "Todos" },
  { label: "Paciente", role: "patient" },
  { label: "Especialista", role: "specialist" },
];

const initialsFor = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (!parts[0]) return "?";
  return (parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`
    : parts[0].substring(0, 2)
  ).toUpperCase();
};

export default function AdminMainScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time the dashboard regains focus (e.g. after creating a user).
  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  if (!fontsLoaded) return null;

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const activePct = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const activeRole = FILTERS.find((f) => f.label === activeFilter)?.role;
  const visibleUsers = activeRole
    ? users.filter((u) => u.role === activeRole)
    : users;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>Vida Activa</Text>
        <TouchableOpacity style={styles.profileIconWrap}>
          <MaterialCommunityIcons name="account-circle" size={32} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <SectionTitle>Panel Principal</SectionTitle>
          <Text style={styles.sectionSubtitle}>Resumen de actividad y gestión del sistema.</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View>
                <Text style={styles.statLabel}>Total Usuarios</Text>
                <Text style={styles.statValue}>{totalUsers}</Text>
              </View>
              <MaterialCommunityIcons name="account-group" size={28} color={Colors.textPrimary} />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View>
                <Text style={styles.statLabel}>Usuarios Activos</Text>
                <Text style={styles.statValue}>{activeUsers}</Text>
              </View>
              <MaterialCommunityIcons name="account-check" size={28} color={Colors.textPrimary} />
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${activePct}%` }]} />
            </View>
          </View>

          <View style={[styles.statCard, styles.statCardInactive]}>
            <View style={styles.statRow}>
              <View>
                <Text style={styles.statLabel}>Usuarios Inactivos</Text>
                <Text style={[styles.statValue, { color: Colors.danger }]}>{inactiveUsers}</Text>
              </View>
              <MaterialCommunityIcons name="account-cancel" size={28} color={Colors.danger} />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <SectionTitle>Acciones Rápidas</SectionTitle>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Colors.primaryPressed }]}
            onPress={() => router.push(routes.createUser as any)}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color="#fff" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Crear usuario</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => router.push("/admin-users" as any)}
          >
            <MaterialCommunityIcons name="account-cog" size={20} color={Colors.textPrimary} style={styles.actionIcon} />
            <Text style={[styles.actionButtonText, { color: Colors.textPrimary }]}>Gestionar usuarios</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <SectionTitle>Resumen de Usuarios</SectionTitle>
        </View>
        
        <View style={styles.filtersContainer}>
          {FILTERS.map(({ label }) => (
            <Chip
              key={label}
              label={label}
              mdi={label === "Todos" ? "filter-variant" : undefined}
              selected={activeFilter === label}
              onPress={() => setActiveFilter(label)}
            />
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.textPrimary} size="large" style={{ marginTop: 30 }} />
        ) : visibleUsers.length === 0 ? (
          <StateMessage empty="No hay usuarios para mostrar." />
        ) : (
          <View style={styles.userListContainer}>
            {visibleUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfoLeft}>
                  <View style={styles.userInitialsAvatar}>
                    <Text style={styles.userInitialsText}>{initialsFor(user.fullName)}</Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.fullName}</Text>
                    <Text style={styles.userRole}>{ROLE_LABEL[user.role]}</Text>
                  </View>
                </View>
                <View style={styles.userInfoRight}>
                  <View style={[
                    styles.statusPill,
                    !user.isActive && styles.statusPillInactive
                  ]}>
                    <View style={[
                      styles.statusDot,
                      !user.isActive && styles.statusDotInactive
                    ]} />
                    <Text style={[
                      styles.statusText,
                      !user.isActive && styles.statusTextInactive
                    ]}>{user.isActive ? 'Activo' : 'Inactivo'}</Text>
                  </View>

                  <TouchableOpacity style={styles.moreOptions} onPress={() => router.push("/admin-users" as any)}>
                    <MaterialCommunityIcons name="dots-vertical" size={20} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/admin-users" as any)}>
              <Text style={styles.viewAllText}>Ver todos los usuarios</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      <BottomNav role="admin" active="home" />

      <TouchableOpacity style={styles.backToSplash} onPress={() => router.replace("/" as any)}>
        <MaterialCommunityIcons name="home-outline" size={18} color={Colors.textPrimary} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 10,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  logoText: {
    fontSize: 20,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },
  backToSplash: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIconWrap: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.7)",
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  statCardInactive: {
    backgroundColor: 'rgba(231,87,86,0.15)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.7)",
  },
  statValue: {
    fontSize: 32,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    marginTop: 4,
    lineHeight: 38,
  },
  statTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statTrendText: {
    fontSize: 11,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  statTrendSubtext: {
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.6)",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(23, 32, 51, 0.1)",
    marginTop: 16,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryPressed,
  },
  actionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },

  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userListContainer: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 12,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInitialsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitialsText: {
    fontSize: 14,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  userRole: {
    fontSize: 11,
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.6)",
  },
  userInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
    moreOptions: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusPillInactive: {
    backgroundColor: 'rgba(225, 160, 160, 0.8)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryPressed,
  },
  statusDotInactive: {
    backgroundColor: Colors.danger,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  statusTextInactive: {
    color: Colors.danger,
  },

  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.7)",
    textAlign: "center",
    marginTop: 24,
  }
});
