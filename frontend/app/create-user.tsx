// app/create-user.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { createUserApi, CreateUserPayload } from "../services/userService";

import { Colors, GradientColors } from "../constants/theme";
const GENDERS = ["Masculino", "Femenino", "Otro"] as const;

// Formatea el RUT chileno a medida que se escribe (12.345.678-9).
const formatRut = (value: string) => {
  const cleanValue = value.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);
  if (cleanValue.length === 0) return "";
  if (cleanValue.length === 1) return cleanValue;
  const dv = cleanValue.slice(-1);
  const body = cleanValue.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${body}-${dv}`;
};

export default function CreateUserScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"patient" | "specialist">("patient");

  // Campos por rol (se guardan en patients / specialists en el backend).
  const [rut, setRut] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string>("");
  const [address, setAddress] = useState("");
  const [specialty, setSpecialty] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // Acordeón: los datos opcionales arrancan colapsados (E1 — divulgación progresiva).
  const [showMore, setShowMore] = useState(false);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../assets/fonts/Inter_600SemiBold.ttf"),
  });

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Atención", "Ingrese el nombre y el correo.");
      return;
    }

    if (age.trim() && Number.isNaN(Number(age))) {
      Alert.alert("Atención", "La edad debe ser un número.");
      return;
    }

    // Solo enviamos los campos con valor; los vacíos quedan NULL en el backend.
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

      // Mostrar el mensaje de éxito
      setShowSuccessToast(true);

      const goBack = () => {
        setShowSuccessToast(false);
        router.back(); // Vuelve a la pantalla anterior
      };

      // Surface the one-time temporary password so the admin can share it.
      if (created.temp_password) {
        setTimeout(() => {
          Alert.alert(
            "Usuario creado",
            `Contraseña temporal para ${created.email}:\n\n${created.temp_password}\n\nCompártela con el usuario; no se volverá a mostrar.`,
            [{ text: "Entendido", onPress: goBack }]
          );
        }, 600);
      } else {
        setTimeout(goBack, 3000);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "No se pudo crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.bannerTitle}>Crear Usuario</Text>
        <Text style={styles.bannerSubtitle}>
          Registra un nuevo perfil en el sistema
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Nombre */}
            <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.fieldInput}
                placeholder="Ej. Ana María Silva"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Correo */}
            <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.fieldInput}
                placeholder="ana.silva@ejemplo.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Rol */}
            <Text style={styles.fieldLabel}>ROL DEL USUARIO</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity
                style={[styles.pill, role === "patient" && styles.pillActive]}
                onPress={() => setRole("patient")}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={18}
                  color={role === "patient" ? Colors.onPrimary : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.pillText,
                    role === "patient" && styles.pillTextActive,
                  ]}
                >
                  Paciente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pill, role === "specialist" && styles.pillActive]}
                onPress={() => setRole("specialist")}
              >
                <MaterialCommunityIcons
                  name="medical-bag"
                  size={18}
                  color={role === "specialist" ? Colors.onPrimary : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.pillText,
                    role === "specialist" && styles.pillTextActive,
                  ]}
                >
                  Especialista
                </Text>
              </TouchableOpacity>
            </View>

            {/* RUT */}
            <Text style={styles.fieldLabel}>RUT</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={20}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.fieldInput}
                placeholder="Ej. 12.345.678-9"
                placeholderTextColor={Colors.textMuted}
                value={rut}
                onChangeText={(text) => setRut(formatRut(text))}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                importantForAutofill="no"
                keyboardType={Platform.OS === "android" ? "visible-password" : "default"}
                maxLength={12}
              />
            </View>

            {/* ── Acordeón: datos adicionales (opcional) ── */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowMore((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.accordionTitle}>Datos adicionales (opcional)</Text>
              <MaterialCommunityIcons
                name={showMore ? "chevron-up" : "chevron-down"}
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            {showMore && (
              <>
            {/* Teléfono */}
            <Text style={styles.fieldLabel}>TELÉFONO</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.fieldInput}
                placeholder="Ej. +56912345678"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Campos según el rol */}
            {role === "patient" ? (
              <>
                {/* Edad */}
                <Text style={styles.fieldLabel}>EDAD</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={20}
                    color={Colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Ej. 34"
                    placeholderTextColor={Colors.textMuted}
                    value={age}
                    onChangeText={(text) => setAge(text.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>

                {/* Género */}
                <Text style={styles.fieldLabel}>GÉNERO</Text>
                <View style={styles.pillRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.pill, gender === g && styles.pillActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          gender === g && styles.pillTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Dirección */}
                <Text style={styles.fieldLabel}>DIRECCIÓN</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color={Colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Ej. Av. Ficticia 123, Santiago"
                    placeholderTextColor={Colors.textMuted}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </>
            ) : (
              <>
                {/* Especialidad */}
                <Text style={styles.fieldLabel}>ESPECIALIDAD</Text>
                <View style={styles.inputRow}>
                  <MaterialCommunityIcons
                    name="medal-outline"
                    size={20}
                    color={Colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Ej. Kinesiología"
                    placeholderTextColor={Colors.textMuted}
                    value={specialty}
                    onChangeText={setSpecialty}
                  />
                </View>
              </>
            )}
              </>
            )}
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast de Éxito Flotante */}
      {showSuccessToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastIconCircle}>
            <MaterialCommunityIcons name="check" size={16} color={Colors.onPrimary} />
          </View>
          <View style={styles.toastTextContainer}>
            <Text style={styles.toastTitle}>Éxito</Text>
            <Text style={styles.toastMessage}>
              Usuario guardado correctamente.
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowSuccessToast(false)}>
            <MaterialCommunityIcons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    alignSelf: "flex-start",
    padding: 4,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.onPrimary,
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
  },
  pillRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  accordionTitle: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  pillTextActive: {
    color: Colors.onPrimary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },
  toastContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  toastIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  toastTextContainer: { flex: 1 },
  toastTitle: {
    fontSize: 14,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },
  toastMessage: {
    fontSize: 13,
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.7)",
    marginTop: 2,
  },
});
