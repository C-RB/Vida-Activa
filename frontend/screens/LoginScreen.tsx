import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { loginApi } from "../services/authService";
import type { UserRole } from "../services/authStore";
import { routes } from "../router/routes";
import { Colors, Type } from "../constants/theme";
import AuthScreen from "../components/layout/AuthScreen";
import Button from "../components/ui/Button";
import TextButton from "../components/ui/TextButton";
import TextField from "../components/ui/TextField";

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
    <AuthScreen
      title="Le damos la bienvenida"
      subtitle="Ingrese con el correo y la clave que le entregó su especialista."
    >
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

      <Text style={[Type.secondary, styles.footer]}>
        ¿Primera vez? Su especialista le entregará su correo y su clave.
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  link: {
    alignItems: "flex-end",
  },
  footer: {
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
