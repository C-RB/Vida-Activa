import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Colors, Radius, Type } from "../../constants/theme";
import Icon from "./Icon";

export type ToastMessage = { text: string; tone: "success" | "danger" };

type Props = {
  message: ToastMessage | null;
  onHide: () => void;
};

const VISIBLE_MS = 2500;

// Fades in at the bottom of the screen, stays briefly and calls `onHide`.
export default function Toast({ message, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  // Kept in a ref so an inline `onHide` does not restart the animation on every render.
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!message) return;
    const animation = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(VISIBLE_MS),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => finished && onHideRef.current());
    return () => animation.stop();
  }, [message, opacity]);

  if (!message) return null;
  const success = message.tone === "success";

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[styles.toast, { opacity, backgroundColor: success ? Colors.info : Colors.danger }]}
    >
      <Icon
        mdi={success ? "check-circle-outline" : "alert-circle-outline"}
        size={22}
        color={Colors.onPrimary}
      />
      <Text style={[Type.secondaryStrong, styles.text]}>{message.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: Radius.input,
  },
  text: {
    flex: 1,
    color: Colors.onPrimary,
  },
});
