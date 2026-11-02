
/** MediaPipe BlazePose landmark. x and y are normalized to [0, 1]. */
export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
};

/** Rep state machine. A rep counts on the (hold | ascending) → standing transition. */
export type ValidatorPhase = 'standing' | 'descending' | 'hold' | 'ascending';

/** Validator output for one frame. repCompleted is true only on the frame that closes a rep. */
export type ValidatorResult = {
  ok: boolean;
  feedback: string | null;
  repCompleted: boolean;
  phase?: ValidatorPhase;
};

/** Mutable state kept between frames; reset when the exercise or level changes. */
export type ValidatorState = {
  phase: ValidatorPhase;
  prevAngle: number;
  repCount: number;
};

/** Validates a single frame. */
export type ValidatorFn = (lms: Landmark[], state: ValidatorState) => ValidatorResult;

/** A registrable exercise. `id` must match the registry key and the backend exerciseId. */
export type ExerciseValidator = {
  id: string;
  levels: Record<number, ValidatorFn>;
};
