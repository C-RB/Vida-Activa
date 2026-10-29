import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

import { Colors } from "../../../constants/theme";
export function CustomButton({ title, onPress, loading }: { title: string; onPress: () => void; loading: boolean }) {
  const [fontsLoaded] = useFonts({
    InterRegular: require('../../../assets/fonts/Inter_400Regular.ttf'),
    InterSemiBold: require('../../../assets/fonts/Inter_600SemiBold.ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <TouchableOpacity
      style={[styles.button, loading && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  text: { fontFamily: 'InterSemiBold', fontSize: 16, color: Colors.onPrimary }
});