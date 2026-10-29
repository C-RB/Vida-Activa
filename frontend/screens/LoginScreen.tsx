import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { loginApi } from "../services/authService";
import type { UserRole } from "../services/authStore";
import { routes } from "../router/routes";
import { Colors, Type } from "../constants/theme";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import TextButton from "../components/ui/TextButton";

const HOME_BY_ROLE: Record<UserRole, string> = {
  ADMIN: routes.adminMain,
  SPECIALIST: routes.specialistHome,
  PATIENT: routes.patientHome,
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert("Falta información", "Ingrese su correo y su clave.");
      return;
    }

    setLoading(true);
    try {
      const { role } = await loginApi(normalizedEmail, password);

      // Use replace so going back no longer returns to login.
      router.replace((HOME_BY_ROLE[role] ?? "/") as any);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      Alert.alert("No pudimos ingresar", message);
    } finally {
      setLoading(false);
    }
  };

  // The specialist hands out the password; there is no recovery flow.
  const handleForgot = () => {
    Alert.alert(
      "¿Olvidó su clave?",
      "Pídale a su especialista que le entregue una clave nueva."
    );
  };

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

        <TextField
          label="Correo"
          icon="mail"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          placeholder="nombre@correo.cl"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
          editable={!loading}
        />

        <TextField
          label="Clave"
          icon="lock"
          secure
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          editable={!loading}
        />

        <View style={styles.link}>
          <TextButton title="¿Olvidó su clave?" onPress={handleForgot} />
        </View>

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
  link: {
    alignItems: "flex-start",
  },
});
