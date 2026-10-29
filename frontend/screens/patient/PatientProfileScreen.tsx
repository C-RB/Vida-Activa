import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import BottomNav from '../../components/layout/BottomNav';
import { getSession } from '../../services/authStore';


import { Colors, GradientColors } from "../../constants/theme";
export default function PatientProfileScreen() {
    const [fontsLoaded] = useFonts({
        InterRegular: require("../../assets/fonts/Inter_400Regular.ttf"),
        InterSemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
    });

    if (!fontsLoaded) {
        return null;
    }

    const session = getSession();
    const patient = session?.patient;

    console.log("Paciente en sesión:", patient);

    return (
        <LinearGradient colors={GradientColors as any} style={styles.container}>
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>Mi Perfil</Text>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.contact}>
                    <MaterialCommunityIcons name="account-circle-outline" size={60} color={Colors.textPrimary} />
                    <View style={styles.textBlock}>
                        <Text style={styles.name}>{patient?.fullName}</Text>
                        <Text style={styles.name}>{patient?.age} Años</Text>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>Información del contacto</Text>
                <View style={styles.contact_info}>
                    <View style={styles.item}>
                        <MaterialCommunityIcons name="email-outline" size={30} color={Colors.textPrimary} />
                        <View style={styles.textBlock}>
                            <Text style={styles.name_contact}>Correo Electrónico</Text>
                            <Text style={styles.name_contact}>{patient?.email}</Text>
                        </View>
                    </View>
                    <View style={styles.item}>
                        <MaterialCommunityIcons name="phone-outline" size={30} color={Colors.textPrimary} />
                        <View style={styles.textBlock}>
                            <Text style={styles.name_contact}>Teléfono</Text>
                            <Text style={styles.name_contact}>{patient?.phone}</Text>
                        </View>
                    </View>
                    <View style={styles.item}>
                        <MaterialCommunityIcons name="map-marker-outline" size={30} color={Colors.textPrimary} />
                        <View style={styles.textBlock}>
                            <Text style={styles.name_contact}>Dirección</Text>
                            <Text style={styles.name_contact}>{patient?.address}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>Mi profesional de salud</Text>
                <View style={styles.contact_info}>
                    <View style={styles.item}>
                        <MaterialCommunityIcons name="account-circle-outline" size={60} color={Colors.textPrimary} />
                        <View style={styles.textBlock}>
                            <Text style={styles.name}>Dr Carlos Fernández</Text>
                            <Text style={styles.name}>38 años</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <BottomNav role="patient" active="profile" />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    banner: {
        width: '100%',
        backgroundColor: Colors.primary,
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    bannerTitle: {
        fontSize: 24,
        fontFamily: 'InterSemiBold',
        color: Colors.onPrimary,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    sectionLabel: {
        fontSize: 18,
        fontFamily: 'InterSemiBold',
        color: Colors.textPrimary,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    textBlock: {
        marginLeft: 10,
        flex: 1,
    },
    contact: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 2,
        borderRadius: 20,
        borderColor: Colors.primary,
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        marginTop: 16,
    },
    contact_info: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderRadius: 20,
        padding: 20,
        borderColor: Colors.primary,
        backgroundColor: Colors.surface,
    },
    name_contact: {
        fontSize: 16,
        marginLeft: 10,
        fontFamily: 'InterRegular',
        color: Colors.textPrimary,
    },
    name: {
        fontSize: 20,
        marginLeft: 10,
        fontFamily: 'InterRegular',
        color: Colors.textPrimary,
    },
});
