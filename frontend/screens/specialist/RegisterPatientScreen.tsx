import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { getPatientByRut, assignPatientToSpecialist, Patient } from "../../services/patientService";

import { Colors, GradientColors } from "../../constants/theme";
import SectionTitle from "../../components/ui/SectionTitle";
const formatRut = (value: string) => {
  // Keep only digits and K, max 9 chars (8 body + check digit): a longer formatted RUT would be cut by the
  // input's maxLength mid-format and desync the native and controlled values (repeated or phantom digits).
  const cleanValue = value.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);

  if (cleanValue.length === 0) return "";
  if (cleanValue.length === 1) return cleanValue;

  const dv = cleanValue.slice(-1);
  let body = cleanValue.slice(0, -1);

  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${body}-${dv}`;
};

export default function AssignPatientScreen({
  navigation,
}: {
  navigation?: any;
}) {
  const router = useRouter();
  
  const [rutInput, setRutInput] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  const handleRutChange = (text: string) => {
    setRutInput(formatRut(text));
  };

  const handleSearch = async () => {
    if (!rutInput.trim()) {
      Alert.alert("Atención", "Por favor ingresa un RUT para buscar.");
      return;
    }
    
    setIsSearching(true);
    setFoundPatient(null);
    try {
      const patient = await getPatientByRut(rutInput);
      setFoundPatient(patient);
    } catch (err: any) {
      Alert.alert("No encontrado", err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!foundPatient) return;
    
    setIsAssigning(true);
    try {
      await assignPatientToSpecialist(foundPatient.rut);
      Alert.alert("Éxito", "Paciente asignado correctamente a tu lista.", [
        { text: "OK", onPress: () => (navigation?.goBack ? navigation.goBack() : router.back()) },
      ]);
    } catch {
      Alert.alert("Error", "Ocurrió un problema al asignar el paciente.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.bannerTitle}>Asignar Paciente</Text>
        <Text style={styles.bannerSubtitle}>Añade un paciente existente a tu lista</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.fieldLabel}>INGRESE EL RUT DEL PACIENTE</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.fieldInput, styles.searchInput]}
              value={rutInput}
              onChangeText={handleRutChange} // Aquí aplicamos la función
              placeholder="Ej: 12.345.678-9"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters" // El dígito verificador 'K' va en mayúscula
              autoCorrect={false}
              autoComplete="off"
              importantForAutofill="no" // Evita que el autofill de Android inyecte valores
              textContentType="none"
              // visible-password on Android disables the suggestion bar (which inserted repeated digits) and allows 'K'.
              keyboardType={Platform.OS === "android" ? "visible-password" : "default"}
              maxLength={12} // XX.XXX.XXX-X son 12 chars; el cuerpo ya se limita en formatRut
              editable={!isSearching}
            />
            <TouchableOpacity 
              style={styles.searchBtn} 
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator color={Colors.textPrimary} size="small" />
              ) : (
                <MaterialCommunityIcons name="magnify" size={24} color={Colors.textPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {foundPatient && (
            <View style={styles.resultContainer}>
              
              <View style={styles.card}>
                <View style={styles.profileRow}>
                  <View style={styles.avatarCircle}>
                    <MaterialCommunityIcons name="account-outline" size={36} color={Colors.textPrimary} />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{foundPatient.fullName}</Text>
                    <Text style={styles.profileRut}>{foundPatient.rut}</Text>
                    
                    <View style={styles.statsRow}>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Edad</Text>
                        <Text style={styles.statValue}>{foundPatient.age} años</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Género</Text>
                        <Text style={styles.statValue}>{foundPatient.gender}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <SectionTitle>Información de Contacto</SectionTitle>

              <View style={styles.card}>
                <View style={styles.contactItem}>
                  <View style={styles.contactIconBg}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.contactText}>{foundPatient.email}</Text>
                </View>
                
                <View style={styles.contactItem}>
                  <View style={styles.contactIconBg}>
                    <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.contactText}>{foundPatient.phone}</Text>
                </View>
                
                <View style={styles.contactItem}>
                  <View style={styles.contactIconBg}>
                    <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.contactText}>{foundPatient.address}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmAssign}
                disabled={isAssigning}
              >
                {isAssigning ? (
                  <ActivityIndicator color={Colors.textPrimary} size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Añadir Paciente</Text>
                )}
              </TouchableOpacity>

            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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

  fieldLabel: {
    fontSize: 12,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  searchInput: {
    flex: 1,
  },
  searchBtn: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    height: 48,
    width: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  resultContainer: {
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  profileRut: {
    fontSize: 13,
    fontFamily: "InterRegular",
    color: Colors.primary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
  },
  statBox: {
    flexDirection: "column",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "InterRegular",
    color: "rgba(23, 32, 51, 0.6)",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
  },

  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
    flex: 1,
  },

  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },
});