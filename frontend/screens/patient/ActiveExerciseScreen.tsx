import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
  VisionCameraProxy,
} from 'react-native-vision-camera';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { useExerciseValidator } from '../../validation/useExerciseValidator';
import { EXERCISES } from '../../constants/exercises';
import type { Landmark } from '../../validation/types';
import PoseSkeleton, { PoseSkeletonHandle } from '../../components/exercise/PoseSkeleton';
import { updateExerciseProgress } from '../../services/sessionService';

import { Colors, GradientColors } from "../../constants/theme";

const FRAME_INTERVAL = 4; // process 1 of every 4 frames (~7 fps from a 30 fps camera)

// Target reps per series (fixed for now, matching the "/10" in the UI).
const REP_GOAL = 10;

const posePlugin = VisionCameraProxy.initFrameProcessorPlugin('detectPose', {});

export default function ActiveExerciseScreen() {
  const router = useRouter();

  const { index, sessionId, seIds } = useLocalSearchParams();
  const exercise = EXERCISES[Number(index ?? 0)];

  // seIds: real session_exercise ids (CSV, ordered by order_index) created by POST /api/sessions;
  // the current exercise's id is resolved by index (EXERCISES and session_exercises share the order).
  const sessionExerciseId =
    typeof seIds === 'string' && seIds.length > 0
      ? seIds.split(',')[Number(index ?? 0)]
      : undefined;

  const [fontsLoaded] = useFonts({
    InterRegular: require('../../assets/fonts/Inter_400Regular.ttf'),
    InterSemiBold:    require('../../assets/fonts/Inter_600SemiBold.ttf'),
  });

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  // Pick the format closest to 640×480: MediaPipe rescales to 256×256 anyway, so 1080p frames would be wasted work.
  const format = useCameraFormat(device, [
    { videoResolution: { width: 640, height: 480 } },
  ]);

  const [cameraSize, setCameraSize] = useState({ width: 0, height: 0 });
  const [poseFeedback, setPoseFeedback] = useState<string | null>(null);
  const [poseFeedbackOk, setPoseFeedbackOk] = useState<boolean>(true);
  const [localReps, setLocalReps]   = useState(0);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError]     = useState<string | null>(null);
  const [progressError, setProgressError]   = useState<string | null>(null);

  // Landmarks are not root state: they go straight to the skeleton by ref so a new frame doesn't re-render this screen.
  const skeletonRef = useRef<PoseSkeletonHandle>(null);

  // Authoritative detected-reps accumulator: a ref avoids a render per frame; the state above only feeds the badge.
  const localRepsRef = useRef(0);

  // session_id from the POST and persisted series live in refs so the frame-processor callback always reads the current value.
  const sessionIdRef        = useRef<string | null>(null);
  const seriesCompletedRef  = useRef(0);

  useEffect(() => {
    localRepsRef.current = 0;
    setLocalReps(0);
  }, [exercise.exerciseId]);

  const startSession = useCallback(() => {
    setSessionLoading(false);
    setSessionError(null);
    if (typeof sessionId === 'string') {
        sessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const persistProgress = useCallback(
    async (seriesCompleted: number, repsCompleted: number) => {
      const sid = sessionIdRef.current;
      if (!sid || !sessionExerciseId) return;
      try {
        setProgressError(null);
        await updateExerciseProgress(sid, sessionExerciseId, {
          series_completed: seriesCompleted,
          reps_completed: repsCompleted,
        });
      } catch (e: any) {
        setProgressError(e?.message ?? 'No se pudo guardar el progreso');
      }
    },
    [sessionExerciseId],
  );

  const validator = useExerciseValidator(exercise.exerciseId, 1);

  const frameCount = useSharedValue(0);

  const onLandmarksDetected = useCallback((lms: Landmark[]) => {
    skeletonRef.current?.update(lms);

    if (lms.length === 0) {
      setPoseFeedback('No se detecta el cuerpo');
      setPoseFeedbackOk(false);
      return;
    }

    const result = validator.evaluate(lms);
    setPoseFeedback(result.feedback);
    setPoseFeedbackOk(result.ok);

    if (result.repCompleted) {
      localRepsRef.current += 1;
      setLocalReps(localRepsRef.current);

      // Every REP_GOAL reps closes a series: persist the accumulated progress to the backend.
      const seriesNow = Math.floor(localRepsRef.current / REP_GOAL);
      if (seriesNow > seriesCompletedRef.current) {
        seriesCompletedRef.current = seriesNow;
        void persistProgress(seriesNow, localRepsRef.current);
      }
    }
  }, [validator, persistProgress]);

  const onLandmarksJS = useMemo(
    () => Worklets.createRunOnJS(onLandmarksDetected),
    [onLandmarksDetected],
  );

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    frameCount.value += 1;
    if (frameCount.value % FRAME_INTERVAL !== 0) return;

    if (posePlugin == null) return;
    const result = posePlugin.call(frame) as unknown as Landmark[] | null;
    onLandmarksJS(result ?? []);
  }, [onLandmarksJS]);

  const onCameraLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraSize({ width, height });
  }, []);

  if (!fontsLoaded) return null;

  if (!hasPermission) {
    return (
      <LinearGradient colors={GradientColors as any} style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Necesitamos acceso a tu cámara para el ejercicio.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Otorgar Permiso</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (device == null) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  // Session starting: block until there is a session_id (or an error to retry)
  if (sessionLoading) {
    return (
      <LinearGradient colors={GradientColors as any} style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={Colors.textPrimary} />
        <Text style={[styles.permissionText, { marginTop: 20 }]}>Iniciando sesión…</Text>
      </LinearGradient>
    );
  }

  if (sessionError) {
    return (
      <LinearGradient colors={GradientColors as any} style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{sessionError}</Text>
        <TouchableOpacity style={styles.button} onPress={startSession}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const activeFeedback = poseFeedback ?? null;

  return (
    <LinearGradient colors={GradientColors as any} style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={30} color={Colors.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.exerciseName}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content} onLayout={onCameraLayout}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
          zoom={0.75}
          onLayout={onCameraLayout}
        />

        <PoseSkeleton
          ref={skeletonRef}
          width={cameraSize.width}
          height={cameraSize.height}
        />

        <View style={styles.controlsOverlay}>
          {progressError && (
            <View style={[styles.feedbackBadge, { backgroundColor: Colors.danger }]}>
              <Ionicons name="cloud-offline-outline" size={26} color={Colors.onPrimary} style={{ marginRight: 10 }} />
              <Text style={styles.feedbackText}>{progressError}</Text>
            </View>
          )}

          {activeFeedback && (
            <View style={[
              styles.feedbackBadge,
              { backgroundColor: poseFeedbackOk ? Colors.info : Colors.warning },
            ]}>
              <Ionicons
                name={poseFeedbackOk ? 'checkmark-circle-outline' : 'warning-outline'}
                size={26}
                color={Colors.onPrimary}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.feedbackText}>{activeFeedback}</Text>
            </View>
          )}

          <View style={styles.progressSection}>
            <Text style={styles.seriesText}>
              Serie {1} de {1}
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${((0 + localReps) / 10) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.repsBadge}>
            <Text style={styles.repsNumbers}>
              {0 + localReps}/{10}
            </Text>
            <Text style={styles.repsLabel}>Repeticiones</Text>
          </View>

          <TouchableOpacity style={styles.pauseButton}>
            <Text style={styles.pauseButtonText}>Pausar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endButton}
            onPress={() => {
              const currentIndex = Number(index ?? 0);
              if (currentIndex < EXERCISES.length - 1) {
                // Forward sessionId and seIds to the next exercise; without them the progress PUT has no ids from the 2nd exercise on.
                const sid = sessionIdRef.current ?? '';
                router.push(
                  `/instruction?index=${currentIndex + 1}&sessionId=${sid}&seIds=${seIds ?? ''}`
                );
              } else {
                // Pass session_id so the final screen can call POST /api/sessions/{id}/complete.
                router.push({
                  pathname: '/post-exercise-survey',
                  params: { sessionId: sessionIdRef.current ?? '' },
                });
              }
            }}
          >
            <Text style={styles.endButtonText}>Terminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: {
    fontSize: 22, textAlign: 'center', marginBottom: 24,
    fontFamily: 'InterSemiBold', color: Colors.textPrimary, lineHeight: 30,
  },
  button: { backgroundColor: Colors.primary, paddingVertical: 18, paddingHorizontal: 28, borderRadius: 16 },
  buttonText: { color: Colors.onPrimary, fontFamily: 'InterSemiBold', fontSize: 22 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 18,
    backgroundColor: Colors.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: {
    flex: 1, textAlign: 'center', color: Colors.onPrimary, fontSize: 24, fontFamily: 'InterSemiBold',
  },
  content: { flex: 1, position: 'relative', backgroundColor: Colors.primaryPressed },
  controlsOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 30, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  feedbackBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12,
    width: '92%', justifyContent: 'center', marginBottom: 12,
  },
  feedbackText:   { color: Colors.onPrimary, fontFamily: 'InterSemiBold', fontSize: 20, flexShrink: 1 },
  progressSection: { width: '100%', marginBottom: 16 },
  seriesText:      { fontSize: 20, color: Colors.onPrimary, fontFamily: 'InterSemiBold', marginBottom: 8 },
  progressBarBackground: { height: 14, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 8, overflow: 'hidden' },
  progressBarFill:       { height: '100%', backgroundColor: Colors.primary, borderRadius: 8 },
  repsBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: Colors.border,
    borderRadius: 30, paddingVertical: 12, paddingHorizontal: 28, marginBottom: 18,
  },
  repsNumbers:    { fontSize: 36, fontFamily: 'InterSemiBold', color: Colors.onPrimary, marginRight: 12 },
  repsLabel:      { fontSize: 22, color: Colors.onPrimary, fontFamily: 'InterSemiBold' },
  pauseButton: {
    width: '85%', backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: Colors.border,
    paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12,
  },
  pauseButtonText: { color: Colors.onPrimary, fontSize: 24, fontFamily: 'InterSemiBold' },
  endButton:       { width: '85%', backgroundColor: Colors.danger, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  endButtonText:   { color: Colors.onPrimary, fontSize: 24, fontFamily: 'InterSemiBold' },
});
