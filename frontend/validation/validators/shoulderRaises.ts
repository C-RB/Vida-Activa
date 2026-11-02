/**
 * Shoulder raises (lateral arm raise). Main metric: hip→shoulder→elbow angle per side
 * (~20–40° at rest, >= 85° at shoulder height). Same state machine as toeTouch:
 * a rep counts on the (hold | ascending) → standing transition.
 */

import {
  ExerciseValidator,
  Landmark,
  ValidatorFn,
  ValidatorPhase,
  ValidatorResult,
  ValidatorState,
} from '../types';
import { calculateAngle } from '../geometry';
import {
  LEFT_ELBOW,
  LEFT_HIP,
  LEFT_SHOULDER,
  LEFT_WRIST,
  MIN_VISIBILITY,
  RIGHT_ELBOW,
  RIGHT_HIP,
  RIGHT_SHOULDER,
  RIGHT_WRIST,
} from '../landmarkIndices';

const KEY_INDICES = [
  LEFT_SHOULDER, RIGHT_SHOULDER,
  LEFT_ELBOW,    RIGHT_ELBOW,
  LEFT_WRIST,    RIGHT_WRIST,
  LEFT_HIP,      RIGHT_HIP,
];

// Below this hip→shoulder→elbow angle the arms are at rest
const STANDING_ARM_ANGLE = 50;

// Elbows must stay almost straight while lifting
const ELBOW_STRAIGHT_ANGLE = 150;

// Max angle difference allowed between the left and right arm
const ARM_SYMMETRY_TOLERANCE = 25;


type LevelTarget = {
  minAngle: number;
  successMsg: string;
};

const LEVEL_TARGETS: Record<number, LevelTarget> = {
  1: {
    minAngle: 85,
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

function nextPhase(
  prev: ValidatorPhase,
  avgArmAngle: number,
  levelReached: boolean,
): ValidatorPhase {
  if (avgArmAngle < STANDING_ARM_ANGLE) return 'standing';
  if (levelReached) return 'hold';
  if (prev === 'hold' || prev === 'ascending') return 'ascending';
  return 'descending';
}

function buildValidator(level: number): ValidatorFn {
  const target = LEVEL_TARGETS[level] ?? LEVEL_TARGETS[1];

  return (lms: Landmark[], state: ValidatorState): ValidatorResult => {
    if (lms.length === 0 || !allKeyLandmarksVisible(lms)) {
      return {
        ok: false,
        feedback: 'Asegúrate de estar completamente visible',
        repCompleted: false,
        phase: state.phase,
      };
    }

    // Main angle: hip→shoulder→elbow (how high each arm is)
    const armAngleL = calculateAngle(lms[LEFT_HIP],  lms[LEFT_SHOULDER],  lms[LEFT_ELBOW]);
    const armAngleR = calculateAngle(lms[RIGHT_HIP], lms[RIGHT_SHOULDER], lms[RIGHT_ELBOW]);
    const avgArmAngle = (armAngleL + armAngleR) / 2;

    const levelReached = avgArmAngle >= target.minAngle;
    const phase = nextPhase(state.phase, avgArmAngle, levelReached);

    const formError = (feedback: string): ValidatorResult => {
      state.prevAngle = avgArmAngle;
      state.phase = phase;
      return { ok: false, feedback, repCompleted: false, phase };
    };

    // Form rules only apply while the arm moves: natural elbow angles at rest can be < 150° and would
    // trigger false positives that block rep counting.
    if (phase !== 'standing') {
      // Rule 1: straight elbows (shoulder→elbow→wrist > 150°)
      const elbowAngleL = calculateAngle(lms[LEFT_SHOULDER],  lms[LEFT_ELBOW],  lms[LEFT_WRIST]);
      const elbowAngleR = calculateAngle(lms[RIGHT_SHOULDER], lms[RIGHT_ELBOW], lms[RIGHT_WRIST]);
      if (elbowAngleL <= ELBOW_STRAIGHT_ANGLE || elbowAngleR <= ELBOW_STRAIGHT_ANGLE) {
        return formError('Estira los codos');
      }

      // Rule 2: both arms rise to the same height
      if (Math.abs(armAngleL - armAngleR) > ARM_SYMMETRY_TOLERANCE) {
        return formError('Sube los dos brazos a la misma altura');
      }
    }

    // The rep completes on the transition to standing from hold/ascending
    const repCompleted =
      phase === 'standing' &&
      (state.phase === 'hold' || state.phase === 'ascending');

    state.prevAngle = avgArmAngle;
    state.phase = phase;
    if (repCompleted) state.repCount += 1;

    if (repCompleted) {
      return { ok: true, feedback: '¡Repetición completada!', repCompleted, phase };
    }

    switch (phase) {
      case 'standing':
        return { ok: true, feedback: 'Levanta tus brazos', repCompleted, phase };
      case 'descending':
        return { ok: true, feedback: '¡Bien! Sigue subiendo', repCompleted, phase };
      case 'hold':
        return { ok: true, feedback: '¡Mantén la posición!', repCompleted, phase };
      case 'ascending':
        return { ok: true, feedback: 'Baja los brazos lentamente', repCompleted, phase };
    }
  };
}

export const shoulderRaisesValidator: ExerciseValidator = {
  id: 'shoulder_raises',
  levels: {
    1: buildValidator(1),
  },
};
