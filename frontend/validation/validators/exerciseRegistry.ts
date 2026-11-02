/**
 * Registry of exercise validators: the only place exercises are registered.
 * To add one, create a validator in validators/ (see toeTouch.ts) and register it here under
 * its `id`, which must match the backend exerciseId.
 *
 * Conventions: check landmark visibility first (ok: false, no state change); user feedback is
 * short, imperative Spanish; use landmarkIndices and the geometry helpers; increment
 * state.repCount only on the rep-completing transition; keep thresholds as named constants.
 */

import { ExerciseValidator } from '../types';
import { toeTouchValidator } from './toeTouch';
import { legRaiseValidator } from './legRaise';
import { shoulderRaisesValidator } from './shoulderRaises';
import { squatValidator } from './squat';

export const exerciseRegistry: Record<string, ExerciseValidator> = {
  toe_touch: toeTouchValidator,
  leg_raise: legRaiseValidator,
  shoulder_raises: shoulderRaisesValidator,
  squat: squatValidator,
};
