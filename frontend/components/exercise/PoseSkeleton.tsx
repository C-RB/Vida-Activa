import React, { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import type { Landmark } from "../../validation/types";
import { MIN_VISIBILITY } from "../../validation/landmarkIndices";

// MediaPipe BlazePose skeleton: body joints only, no face or feet.
const CONNECTIONS: [number, number][] = [
  [11, 12],           // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // trunk
  [23, 24],           // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
];

// Only landmarks used by the skeleton and feedback: the CONNECTIONS joints plus NOSE (0) for head reference.
const DRAW_LANDMARK_INDICES: number[] = Array.from(new Set([0, ...CONNECTIONS.flat()]));

// High-contrast colors so the skeleton reads over any camera background.
const LINE_COLOR = "#00E5FF";
const JOINT_COLOR = "#76FF03";
const JOINT_OUTLINE_COLOR = "#FFFFFF";

// Landmarks live in this component's own state and are updated through a ref (update()), so a new frame
// only re-renders the skeleton and never ActiveExerciseScreen. width/height still come as props.
export type PoseSkeletonHandle = { update: (lms: Landmark[]) => void };

const PoseSkeleton = React.memo(
  forwardRef<PoseSkeletonHandle, { width: number; height: number }>(
    function PoseSkeleton({ width, height }, ref) {
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);

    useImperativeHandle(ref, () => ({
      update: (lms: Landmark[]) => setLandmarks(lms),
    }), []);

    if (landmarks.length === 0 || width === 0) return null;

    // The bitmap arrives rotated 270° from Kotlin (native portrait), so MediaPipe returns portrait
    // coordinates and x/y must not be swapped. Only the front camera's selfie mirror on X is applied.
    const sx = (lm: Landmark) => (1 - lm.x) * width;        // selfie mirror on X
    const sy = (lm: Landmark) => lm.y * height;             // y as is (portrait)

    return (
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        {CONNECTIONS.map(([a, b]) => {
          const lA = landmarks[a];
          const lB = landmarks[b];
          if (!lA || !lB || lA.visibility < MIN_VISIBILITY || lB.visibility < MIN_VISIBILITY) {
            return null;
          }
          return (
            <Line
              key={`l-${a}-${b}`}
              x1={sx(lA)} y1={sy(lA)}
              x2={sx(lB)} y2={sy(lB)}
              stroke={LINE_COLOR}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}

        {DRAW_LANDMARK_INDICES.map((i) => {
          const lm = landmarks[i];
          if (!lm || lm.visibility < MIN_VISIBILITY) return null;
          return (
            <Circle
              key={`p-${i}`}
              cx={sx(lm)}
              cy={sy(lm)}
              r={5}
              fill={JOINT_COLOR}
              stroke={JOINT_OUTLINE_COLOR}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
    );
    },
  ),
);

export default PoseSkeleton;
