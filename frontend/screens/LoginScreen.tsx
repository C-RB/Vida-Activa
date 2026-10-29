import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { loginApi } from "../services/authService";
import type { UserRole } from "../services/authStore";
import { Colors, Radius, Type } from "../constants/theme";
import { useAppFonts } from "../hooks/useAppFonts";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";

// Where each role lands after a successful login.
const HOME_BY_ROLE: Record<UserRole, string> = {
  ADMIN: "/admin-main",
  SPECIALIST: "/specialist-home",
  PATIENT: "/patient-home",
};

type Field = "email" | "password" | null;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<Field>(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fontsLoaded = useAppFonts();

  // Email is always normalised to lowercase so logins are case-insensitive.
  const handleEmailChange = (text: string) => {
    setEmail(text.toLowerCase());
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert("Falta información", "Ingrese su correo y su clave.");
      return;
    }

    setLoading(true);
    try {
      const { role } = await loginApi(normalizedEmail, password);

      // Route by role. Use replace so "Atrás" no longer returns to login.
      const destination = HOME_BY_ROLE[role] ?? "/";
      router.replace(destination as any);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      Alert.alert("No pudimos ingresar", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // La clave la entrega el especialista; no existe un flujo de recuperación.
  const handleForgot = () => {
    Alert.alert(
      "¿Olvidó su clave?",
      "Pídale a su especialista que le entregue una clave nueva."
    );
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Icon name="logo" size={72} />

        <View style={styles.titleGroup}>
          <Text style={[Type.title1, styles.title]}>Le damos la bienvenida</Text>
          <Text style={[Type.body, styles.subtitle]}>
            Ingrese con el correo y la clave que le entregó su especialista.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[Type.bodyStrong, styles.label]}>Correo</Text>
          <View
            style={[
              styles.input,
              focused === "email" && styles.inputFocused,
            ]}
          >
            <Icon name="mail" size={24} />
            <TextInput
              style={[Type.body, styles.inputText]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="nombre@correo.cl"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              editable={!loading}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[Type.bodyStrong, styles.label]}>Clave</Text>
          <View
            style={[
              styles.input,
              focused === "password" && styles.inputFocused,
            ]}
          >
            <Icon name="lock" size={24} />
            <TextInput
              style={[Type.body, styles.inputText]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              editable={!loading}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Ocultar clave" : "Mostrar clave"
              }
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon
                name="eye"
                size={24}
                color={showPassword ? Colors.primary : undefined}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleForgot}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[Type.bodyStrong, styles.link]}>¿Olvidó su clave?</Text>
        </TouchableOpacity>

        <Button title="Entrar" onPress={handleLogin} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    gap: 24,
    alignItems: "stretch",
  },
  titleGroup: {
    gap: 8,
  },
  title: {
    color: Colors.textPrimary,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  field: {
    gap: 8,
  },
  label: {
    color: Colors.textPrimary,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.input,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputText: {
    flex: 1,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  link: {
    color: Colors.primary,
  },
});
