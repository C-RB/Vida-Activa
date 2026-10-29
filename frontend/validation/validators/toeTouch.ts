/** Reference validator for the toe touch (template for new exercises, see exerciseRegistry.ts). */

import {
  ExerciseValidator,
  Landmark,
  ValidatorFn,
  ValidatorPhase,
  ValidatorResult,
  ValidatorState,
} from '../types';
import { calculateAngle, distanceY } from '../geometry';
import {
  LEFT_ANKLE,
  LEFT_ELBOW,
  LEFT_HIP,
  LEFT_KNEE,
  LEFT_SHOULDER,
  LEFT_WRIST,
  MIN_VISIBILITY,
  NOSE,
  RIGHT_ANKLE,
  RIGHT_ELBOW,
  RIGHT_HIP,
  RIGHT_KNEE,
  RIGHT_SHOULDER,
  RIGHT_WRIST,
} from '../landmarkIndices';

// Per-frame debug logging; keep false in production.
const DEBUG_LOG = true;

const KEY_INDICES = [
  NOSE,
  LEFT_SHOULDER, RIGHT_SHOULDER,
  LEFT_ELBOW, RIGHT_ELBOW,
  LEFT_WRIST, RIGHT_WRIST,
  LEFT_HIP, RIGHT_HIP,
  LEFT_KNEE, RIGHT_KNEE,
  LEFT_ANKLE, RIGHT_ANKLE,
];

// Trunk thresholds use hysteresis (leave standing below 148°, re-enter above 155°) so noise around the
// edge doesn't flip standing/descending. Calibrated with real logs: upright, MediaPipe reports hipAngle 153–167°.
const STANDING_ENTER_HIP_ANGLE = 155;
const STANDING_EXIT_HIP_ANGLE = 148;
const HEAD_CHECK_HIP_ANGLE = 90;
const BACK_ALIGN_TOLERANCE = 0.05;

// Temporal smoothing. Landmarks are noisy (±5-10°) and the pipeline runs at ~4 fps, so the windows are short.
//  - SMOOTH_WINDOW: moving-average size for angles.
//  - PHASE_CONFIRM_FRAMES: consecutive frames needed to confirm a phase change.
const SMOOTH_WINDOW = 3;
const PHASE_CONFIRM_FRAMES = 2;

type LevelTarget = {
  reached: (lms: Landmark[]) => boolean;
  successMsg: string;
};

// Level 1 only: wrists must reach knee height (Y grows downward, so wristY >= kneeY).
const LEVEL_TARGETS: Record<number, LevelTarget> = {
  1: {
    reached: (lms) => {
      const wristY = (lms[LEFT_WRIST].y + lms[RIGHT_WRIST].y) / 2;
      const kneeY = (lms[LEFT_KNEE].y + lms[RIGHT_KNEE].y) / 2;
      return wristY >= kneeY;
    },
    successMsg: '¡Nivel 1 alcanzado!',
  },
};

function allKeyLandmarksVisible(lms: Landmark[]): boolean {
  for (const idx of KEY_INDICES) {
    const lm = lms[idx];
    if (!lm || lm.visibility < MIN_VISIBILITY) return false;
  }
  return true;
}

/** Raw (unsmoothed) phase from the smoothed trunk angle, with hysteresis on the standing edge. */
function rawPhase(
  prev: ValidatorPhase,
  hipAngle: number,
  levelReached: boolean,
): ValidatorPhase {
  if (prev === 'standing') {
    // Leaving standing needs the trunk below EXIT.
    if (hipAngle >= STANDING_EXIT_HIP_ANGLE) return 'standing';
    return levelReached ? 'hold' : 'descending';
  }
  // Entering standing needs the trunk above ENTER.
  if (hipAngle > STANDING_ENTER_HIP_ANGLE) return 'standing';
  if (levelReached) return 'hold';
  if (prev === 'hold' || prev === 'ascending') return 'ascending';
  return 'descending';
}

function buildValidator(level: number): ValidatorFn {
  const target = LEVEL_TARGETS[level] ?? LEVEL_TARGETS[1];

  // Extra validator state lives in this closure (one per level), not in ValidatorState.

  // Circular buffers for the moving average of each angle.
  const angleBuffers: Record<string, number[]> = {};
  const smooth = (key: string, value: number): number => {
    const buf = angleBuffers[key] ?? (angleBuffers[key] = []);
    buf.push(value);
    if (buf.length > SMOOTH_WINDOW) buf.shift();
    return buf.reduce((sum, v) => sum + v, 0) / buf.length;
  };

  // Circular buffer of raw phases: a phase is confirmed only when the last PHASE_CONFIRM_FRAMES agree.
  const phaseHistory: ValidatorPhase[] = [];
  const stabilizePhase = (raw: ValidatorPhase, committed: ValidatorPhase): ValidatorPhase => {
    phaseHistory.push(raw);
    if (phaseHistory.length > PHASE_CONFIRM_FRAMES) phaseHistory.shift();
    if (phaseHistory.length < PHASE_CONFIRM_FRAMES) return committed;
    const candidate = phaseHistory[0];
    for (const p of phaseHistory) {
      if (p !== candidate) return committed; // streak broken: keep the current phase
    }
    return candidate; // N consecutive frames agree: confirm
  };

  return (lms: Landmark[], state: ValidatorState): ValidatorResult => {
    if (lms.length === 0 || !allKeyLandmarksVisible(lms)) {
      return {
        ok: false,
        feedback: 'Asegúrate de estar completamente visible',
        repCompleted: false,
        phase: state.phase,
      };
    }

    // Trunk angle: shoulder→hip→knee (both sides averaged), smoothed.
    const hipAngleL = calculateAngle(lms[LEFT_SHOULDER], lms[LEFT_HIP], lms[LEFT_KNEE]);
    const hipAngleR = calculateAngle(lms[RIGHT_SHOULDER], lms[RIGHT_HIP], lms[RIGHT_KNEE]);
    const hipAngle = smooth('hip', (hipAngleL + hipAngleR) / 2);

    const levelReached = target.reached(lms);

    // Raw phase (with hysteresis), stabilized over N consecutive frames.
    const raw = rawPhase(state.phase, hipAngle, levelReached);
    const phase = stabilizePhase(raw, state.phase);

    // Debug log. Y grows downward: levelReached needs wristY >= kneeY.
    if (DEBUG_LOG) {
      const wristY = (lms[LEFT_WRIST].y + lms[RIGHT_WRIST].y) / 2;
      const kneeY = (lms[LEFT_KNEE].y + lms[RIGHT_KNEE].y) / 2;
      console.log('[toeTouch]', {
        hipAngle: hipAngle.toFixed(1),
        wristY: wristY.toFixed(3),
        kneeY: kneeY.toFixed(3),
        phase,
        raw,
        levelReached,
      });
    }

    // Early-return helper for form errors: keeps state coherent without counting the rep.
    const formError = (feedback: string): ValidatorResult => {
      state.prevAngle = hipAngle;
      state.phase = phase;
      return { ok: false, feedback, repCompleted: false, phase };
    };

    // Form rules are skipped while standing (the only valid feedback there is to lean forward) and until the
    // stabilization buffer is full, when phase and smoothed angles are not reliable yet.
    // "Straight arms" and "straight knees" rules were removed after real measurements: relaxed arms read
    // ~115–125°, and side-on MediaPipe distorts the knee angle (97–115° with visibly straight knees).
    if (phase !== 'standing' && phaseHistory.length >= PHASE_CONFIRM_FRAMES) {
      // Rule 2: aligned back (shoulders at the same height)
      if (distanceY(lms[LEFT_SHOULDER], lms[RIGHT_SHOULDER]) > BACK_ALIGN_TOLERANCE) {
        return formError('Mantén la espalda alineada');
      }

      // Rule 3: aligned head (only during the deep descent, hipAngle < 90)
      if (hipAngle < HEAD_CHECK_HIP_ANGLE) {
        const shoulderY = (lms[LEFT_SHOULDER].y + lms[RIGHT_SHOULDER].y) / 2;
        // Y grows downward: nose above the shoulders means nose.y < shoulder.y
        if (lms[NOSE].y < shoulderY) {
          return formError('No levantes la cabeza');
        }
      }
    }

    // The rep completes on the confirmed transition to standing from hold/ascending.
    const repCompleted =
      phase === 'standing' &&
      (state.phase === 'hold' || state.phase === 'ascending');

    state.prevAngle = hipAngle;
    state.phase = phase;
    if (repCompleted) state.repCount += 1;

    if (repCompleted) {
      return { ok: true, feedback: '¡Repetición completada!', repCompleted, phase };
    }

    switch (phase) {
      case 'standing':
        return { ok: true, feedback: 'Inclínate hacia adelante', repCompleted, phase };
      case 'descending':
        return { ok: true, feedback: '¡Bien! Sigue bajando', repCompleted, phase };
      case 'hold':
        return { ok: true, feedback: '¡Mantén la posición!', repCompleted, phase };
      case 'ascending':
        return { ok: true, feedback: 'Vuelve arriba lentamente', repCompleted, phase };
      default:
        return { ok: true, feedback: null, repCompleted, phase };
    }
  };
}

export const toeTouchValidator: ExerciseValidator = {
  id: 'toe_touch',
  levels: {
    1: buildValidator(1),
  },
};
