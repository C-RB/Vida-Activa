import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { Colors } from "../../constants/theme";
import { useDensity } from "../../hooks/useDensity";
import Icon from "../ui/Icon";

// The demo videos are portrait (9:16); the player keeps that shape so nothing is cropped.
const WIDTH = 220;

const clock = (millis: number) => {
  const total = Math.round(millis / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

type Props = {
  source: number;
};

// Looping demo: tap to pause or resume, with the duration and a fullscreen button.
export default function ExerciseVideo({ source }: Props) {
  const { type } = useDensity();
  const ref = useRef<Video>(null);
  const [playing, setPlaying] = useState(true);
  const [duration, setDuration] = useState<number | null>(null);

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPlaying(status.isPlaying);
    if (status.durationMillis != null) setDuration(status.durationMillis);
  };

  const toggle = () => (playing ? ref.current?.pauseAsync() : ref.current?.playAsync());

  return (
    <View style={styles.frame}>
      <Video
        ref={ref}
        style={StyleSheet.absoluteFill}
        source={source}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={onStatus}
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={playing ? "Pausar video" : "Reproducir video"}
        activeOpacity={1}
        onPress={toggle}
        style={StyleSheet.absoluteFill}
      >
        {!playing && (
          <View style={styles.playWrap}>
            <View style={styles.play}>
              <Icon mdi="play" size={32} color={Colors.primary} />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {duration != null && (
        <View style={styles.duration}>
          <Icon mdi="clock-outline" size={14} color={Colors.onPrimary} />
          <Text style={[type.labelStrong, styles.durationText]}>{clock(duration)}</Text>
        </View>
      )}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Pantalla completa"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => ref.current?.presentFullscreenPlayer()}
        style={styles.fullscreen}
      >
        <Icon mdi="fullscreen" size={22} color={Colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: "center",
    width: WIDTH,
    aspectRatio: 9 / 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.primarySoft,
  },
  playWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  play: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  duration: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: Colors.overlay,
  },
  durationText: {
    color: Colors.onPrimary,
  },
  fullscreen: {
    position: "absolute",
    right: 12,
    bottom: 12,
    padding: 6,
    borderRadius: 999,
    backgroundColor: Colors.overlay,
  },
});
