/**
 * Resolves the validator for the active exercise and level and exposes `evaluate(landmarks)`.
 * State lives in a ref (no re-render per frame) and resets when the exercise or level changes.
 * An unregistered exerciseId yields a valid no-op result.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Landmark, ValidatorResult, ValidatorState } from './types';
import { exerciseRegistry } from './validators/exerciseRegistry';

const initialState = (): ValidatorState => ({
  phase: 'standing',
  prevAngle: 180,
  repCount: 0,
});

const NOOP_RESULT: ValidatorResult = {
  ok: true,
  feedback: null,
  repCompleted: false,
  phase: 'standing',
};

export function useExerciseValidator(
  exerciseId: string | undefined,
  level: number,
) {
  const stateRef = useRef<ValidatorState>(initialState());

  const validatorFn = useMemo(() => {
    if (!exerciseId) return null;
    const validator = exerciseRegistry[exerciseId];
    if (!validator) return null;
    return validator.levels[level] ?? null;
  }, [exerciseId, level]);

  // A new exercise or level starts from a clean state
  useEffect(() => {
    stateRef.current = initialState();
  }, [exerciseId, level]);

  const evaluate = useCallback(
    (lms: Landmark[]): ValidatorResult => {
      if (!validatorFn) return NOOP_RESULT;
      return validatorFn(lms, stateRef.current);
    },
    [validatorFn],
  );

  return { evaluate };
}
