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
  LEFT_SHOULDER, RIGHT_SHOULDER,
  LEFT_HIP, RIGHT_HIP,
  LEFT_KNEE, RIGHT_KNEE,
  LEFT_ANKLE, RIGHT_ANKLE,
  MIN_VISIBILITY,
} from '../landmarkIndices';

// Key landmarks
const LEFT_INDICES = [LEFT_SHOULDER, LEFT_HIP, LEFT_KNEE, LEFT_ANKLE];
const RIGHT_INDICES = [RIGHT_SHOULDER, RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE];

// Thresholds (degrees)
const STANDING_KNEE_ANGLE = 160;
const SQUAT_LEVEL_1_ANGLE = 110; // Half squat
const SQUAT_LEVEL_2_ANGLE = 90;  // Deep or parallel squat
const MIN_HIP_ANGLE = 60;        // Prevents leaning too far forward
const BACK_ALIGN_TOLERANCE = 0.05;

type LevelTarget = {
  reached: (kneeAngle: number) => boolean;
  successMsg: string;
};

// Targets per level
const LEVEL_TARGETS: Record<number, LevelTarget> = {
  1: {
    reached: (kneeAngle) => kneeAngle <= SQUAT_LEVEL_1_ANGLE,
    successMsg: '¡Buena profundidad (Nivel 1)!',
  },
  2: {
    reached: (kneeAngle) => kneeAngle <= SQUAT_LEVEL_2_ANGLE,
    successMsg: '¡Excelente bajada (Nivel 2)!',
  },
};

// Detect which side of the body is visible
function getVisibleSide(lms: Landmark[]): 'left' | 'right' | 'both' | 'none' {
  const leftVisible = LEFT_INDICES.every(idx => lms[idx] && lms[idx].visibility >= MIN_VISIBILITY);
  const rightVisible = RIGHT_INDICES.every(idx => lms[idx] && lms[idx].visibility >= MIN_VISIBILITY);

  if (leftVisible && rightVisible) return 'both';
  if (leftVisible) return 'left';
  if (rightVisible) return 'right';
  return 'none';
}

// State machine driven by the knee angle
function nextPhase(
  prev: ValidatorPhase,
  kneeAngle: number,
  levelReached: boolean,
): ValidatorPhase {
  if (kneeAngle > STANDING_KNEE_ANGLE) return 'standing';
  if (levelReached) return 'hold';
  if (prev === 'hold' || prev === 'ascending') return 'ascending';
  return 'descending';
}

function buildValidator(level: number): ValidatorFn {
  const target = LEVEL_TARGETS[level] ?? LEVEL_TARGETS[1];

  return (lms: Landmark[], state: ValidatorState): ValidatorResult => {
    const side = getVisibleSide(lms);
    if (lms.length === 0 || side === 'none') {
      return {
        ok: false,
        feedback: 'Hazte visible de perfil desde los hombros hasta los tobillos',
        repCompleted: false,
        phase: state.phase,
      };
    }

    // Main metric: knee angle on the visible side
    const kneeAngleL = calculateAngle(lms[LEFT_HIP], lms[LEFT_KNEE], lms[LEFT_ANKLE]);
    const kneeAngleR = calculateAngle(lms[RIGHT_HIP], lms[RIGHT_KNEE], lms[RIGHT_ANKLE]);
    
    let activeKneeAngle = kneeAngleL;
    if (side === 'right') activeKneeAngle = kneeAngleR;
    else if (side === 'both') activeKneeAngle = (kneeAngleL + kneeAngleR) / 2;

    const levelReached = target.reached(activeKneeAngle);
    const phase = nextPhase(state.phase, activeKneeAngle, levelReached);

    const formError = (feedback: string): ValidatorResult => {
      state.prevAngle = activeKneeAngle;
      state.phase = phase;
      return { ok: false, feedback, repCompleted: false, phase };
    };

    // Rule 1: shoulders aligned (front view only)
    if (side === 'both' && distanceY(lms[LEFT_SHOULDER], lms[RIGHT_SHOULDER]) > BACK_ALIGN_TOLERANCE) {
      return formError('Mantén los hombros alineados');
    }

    // Rule 2: trunk lean (hip angle)
    const hipAngleL = calculateAngle(lms[LEFT_SHOULDER], lms[LEFT_HIP], lms[LEFT_KNEE]);
    const hipAngleR = calculateAngle(lms[RIGHT_SHOULDER], lms[RIGHT_HIP], lms[RIGHT_KNEE]);
    
    let activeHipAngle = hipAngleL;
    if (side === 'right') activeHipAngle = hipAngleR;
    else if (side === 'both') activeHipAngle = (hipAngleL + hipAngleR) / 2;

    if (activeHipAngle < MIN_HIP_ANGLE) {
      return formError('Mantén la espalda más recta al bajar');
    }

    const repCompleted =
      phase === 'standing' &&
      (state.phase === 'hold' || state.phase === 'ascending');

    state.prevAngle = activeKneeAngle;
    state.phase = phase;
    if (repCompleted) state.repCount += 1;

    if (levelReached) {
      return { ok: true, feedback: target.successMsg, repCompleted, phase };
    }
    return { ok: true, feedback: null, repCompleted, phase };
  };
}

export const squatValidator: ExerciseValidator = {
  id: 'squat',
  levels: {
    1: buildValidator(1),
    2: buildValidator(2),
  },
};
