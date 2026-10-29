import { TextInput, StyleSheet, View, Text } from 'react-native';
import { useFonts } from 'expo-font';

import { Colors } from "../../../constants/theme";
interface CustomInputProps {
  label: string;
  [key: string]: any;
}

export function CustomInput({ label, ...props }: CustomInputProps) {
  const [fontsLoaded] = useFonts({
    InterRegular: require('../../../assets/fonts/Inter_400Regular.ttf'),
    InterSemiBold: require('../../../assets/fonts/Inter_600SemiBold.ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontFamily: 'InterRegular', fontSize: 16, marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: Colors.border,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  }
});