import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { SvgXml } from "react-native-svg";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  type HandlerStateChangeEvent,
  type PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import PatientNavbar from "../../components/PatientNavbar";
import {
  getNextAppointment,
  NextAppointment,
} from "../../services/appointmentService";
import {
  getActiveRoutine,
  RoutineWithExercises,
} from "../../services/routineService";
import { getSession } from "../../services/authStore";

import { Colors, GradientColors } from "../../constants/theme";
const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

// "2026-06-25" → "Jue 25 jun"
const formatAppointmentDate = (date: string): string => {
  const d = new Date(`${date}T00:00:00`);
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

const TRIANGULOS_SVG = `<svg width="312" height="256" viewBox="0 0 312 256" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_202_395)">
<path d="M152.22 3.84887C154.193 1.7597 157.517 1.75971 159.49 3.84888L282.865 134.48C285.876 137.669 283.616 142.914 279.23 142.914H32.4803C28.0943 142.914 25.8337 137.669 28.8452 134.48L152.22 3.84887Z" fill="#1D5FD1"/>
</g>
<g filter="url(#filter1_d_202_395)">
<path d="M152.22 68.9946C154.193 66.9055 157.517 66.9055 159.49 68.9946L282.865 199.626C285.876 202.815 283.616 208.059 279.23 208.059H32.4803C28.0943 208.059 25.8337 202.815 28.8452 199.626L152.22 68.9946Z" fill="#E8F0FE" fill-opacity="0.93" shape-rendering="crispEdges"/>
</g>
<defs>
<filter id="filter0_d_202_395" x="23.4703" y="2.28198" width="264.769" height="148.632" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_202_395"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_202_395" result="shape"/>
</filter>
<filter id="filter1_d_202_395" x="23.4703" y="67.4277" width="264.769" height="148.632" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_202_395"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_202_395" result="shape"/>
</filter>
</defs>
</svg>`;

export default function PatientHomeScreen() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const [nextAppointment, setNextAppointment] = useState<NextAppointment | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const triangleAnim = useRef(new Animated.Value(0)).current;

  const [routine, setRoutine] = useState<RoutineWithExercises | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
  });

  // Próxima cita presencial del paciente (si tiene alguna agendada).
  useEffect(() => {
    getNextAppointment()
      .then(setNextAppointment)
      .catch(() => setNextAppointment(null));
  }, []);

  // Carga la rutina vigente para hoy del paciente logueado. getActiveRoutine
  // devuelve null (no excepcion) cuando el backend responde 404 sin rutina.
  useEffect(() => {
    const patientId = getSession()?.patient?.id;
    if (!patientId) {
      setLoading(false);
      return;
    }
    getActiveRoutine(patientId)
      .then(setRoutine)
      .catch((e) => console.error("Error fetching active routine:", e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(triangleAnim, {
          toValue: -18,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(triangleAnim, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [triangleAnim]);

  const dismissNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowNotification(false));
  };

  // Navega a la encuesta previa. Si no hay rutina activa hoy, no hace nada
  // (ni el tap ni el swipe deben navegar sin rutina).
  const goToSurvey = () => {
    if (!routine) return;
    router.push(`/previous-survey?routineId=${routine.id}`);
  };

  // Swipe hacia arriba (sentido de la animacion de los triangulos) o hacia la
  // derecha dispara la misma accion que el tap.
  const handleSwipe = (
    e: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    if (e.nativeEvent.state === State.END) {
      const { translationX, translationY } = e.nativeEvent;
      if (translationY < -50 || translationX > 50) {
        goToSurvey();
      }
    }
  };

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
    <LinearGradient colors={GradientColors as any} style={styles.container}>
      {showNotification && nextAppointment && (
        <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
          <MaterialCommunityIcons name="calendar-clock" size={52} color={Colors.onPrimary} />
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>Próxima cita presencial</Text>
            <Text style={styles.notificationBody}>
              {formatAppointmentDate(nextAppointment.date)} - {nextAppointment.time}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={dismissNotification}>
            <MaterialCommunityIcons name="close" size={26} color={Colors.onPrimary} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Bienvenido iniciemos{"\n"}el entrenamiento
        </Text>

        {/* Nombre real de la rutina vigente para hoy (o estado vacio). */}
        {loading ? (
          <ActivityIndicator size="small" color={Colors.textPrimary} style={{ marginTop: 12 }} />
        ) : routine ? (
          <Text style={styles.routineName}>{routine.name}</Text>
        ) : (
          <Text style={styles.emptyRoutine}>
            No tienes rutina programada para hoy
          </Text>
        )}

        <PanGestureHandler onHandlerStateChange={handleSwipe}>
          <View style={styles.swipeArea}>
            <Animated.View
              style={[
                styles.triangles,
                { transform: [{ translateY: triangleAnim }] },
              ]}
            >
              <SvgXml xml={TRIANGULOS_SVG} width={280} height={230} />
            </Animated.View>

            {routine && (
              <TouchableOpacity onPress={goToSurvey}>
                <Text style={styles.slideText}>Desliza{"\n"}Para iniciar</Text>
              </TouchableOpacity>
            )}
          </View>
        </PanGestureHandler>
      </View>

      <PatientNavbar active="home" />

      <TouchableOpacity style={styles.backToSplash} onPress={() => router.replace("/" as any)}>
        <MaterialCommunityIcons name="home-outline" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
    </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    margin: 20,
    padding: 15,
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 24,
  },
  notificationTitle: {
    fontSize: 22,
    fontFamily: "InterSemiBold",
    color: Colors.onPrimary,
  },
  notificationBody: {
    fontSize: 20,
    fontFamily: "InterRegular",
    color: Colors.onPrimary,
    marginTop: 2,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 10,
    padding: 6,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 30,
    lineHeight: 40,
  },
  routineName: {
    fontSize: 22,
    fontFamily: "InterSemiBold",
    color: Colors.primary,
    textAlign: "center",
    marginTop: 12,
  },
  emptyRoutine: {
    fontSize: 18,
    fontFamily: "InterRegular",
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 20,
  },
  swipeArea: {
    alignItems: "center",
  },
  triangles: {
    alignItems: "center",
  },
  slideText: {
    fontSize: 28,
    fontFamily: "InterSemiBold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 36,
  },
  backToSplash: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
