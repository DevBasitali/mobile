import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { extendBooking } from "../../../services/bookingService";

const COLORS = {
    navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
    gold: { 500: "#F59E0B" },
    white: "#FFFFFF",
    gray: { 400: "#9CA3AF", 500: "#6B7280" },
    green: { 500: "#10B981" },
};

export default function ExtendBookingScreen() {
    const { bookingId, currentEndTime, pricePerHour, carName } = useLocalSearchParams();

    const [extraHours, setExtraHours] = useState(1);
    const [loading, setLoading] = useState(false);

    const currentEnd = new Date(currentEndTime);
    const hourlyRate = parseFloat(pricePerHour) || 0;
    const extraCost = extraHours * hourlyRate;

    // Calculate new end time
    const newEndTime = new Date(currentEnd.getTime() + (extraHours * 60 * 60 * 1000));

    const handleConfirmExtend = async () => {
        if (extraHours <= 0) {
            Alert.alert("Invalid Extension", "Please select at least 1 hour");
            return;
        }

        setLoading(true);
        try {
            await extendBooking(bookingId, newEndTime.toISOString());
            Alert.alert(
                "Trip Extended!",
                `Your trip has been extended by ${extraHours} hour(s). Additional charge: PKR ${extraCost.toFixed(0)}`,
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Extend booking error:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to extend trip");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleString("en-PK", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <LinearGradient colors={[COLORS.navy[900], COLORS.navy[800]]} style={styles.header}>
                <SafeAreaView edges={["top"]} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Extend Trip</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Car Info */}
                <View style={[styles.card, { flexDirection: "row", alignItems: "center" }]}>
                    <Ionicons name="car-sport" size={24} color={COLORS.gold[500]} />
                    <Text style={styles.carName}>{carName}</Text>
                </View>

                {/* Current End Time */}
                <View style={styles.card}>
                    <Text style={styles.label}>Current End Time</Text>
                    <Text style={styles.timeValue}>{formatTime(currentEnd)}</Text>
                </View>

                {/* Hours Selector */}
                <View style={styles.card}>
                    <Text style={styles.label}>Extend By (Hours)</Text>
                    <View style={styles.hoursSelector}>
                        <TouchableOpacity
                            style={[styles.hourBtn, extraHours <= 1 && styles.hourBtnDisabled]}
                            onPress={() => setExtraHours(Math.max(1, extraHours - 1))}
                            disabled={extraHours <= 1}
                        >
                            <Ionicons name="remove" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <View style={styles.hoursDisplay}>
                            <Text style={styles.hoursValue}>{extraHours}</Text>
                            <Text style={styles.hoursLabel}>hour(s)</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.hourBtn}
                            onPress={() => setExtraHours(extraHours + 1)}
                        >
                            <Ionicons name="add" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* New End Time */}
                <View style={styles.card}>
                    <Text style={styles.label}>New End Time</Text>
                    <Text style={[styles.timeValue, { color: COLORS.green[500] }]}>
                        {formatTime(newEndTime)}
                    </Text>
                </View>

                {/* Cost Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Cost Summary</Text>

                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Extra Hours</Text>
                        <Text style={styles.costValue}>{extraHours} hour(s)</Text>
                    </View>

                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Rate per Hour</Text>
                        <Text style={styles.costValue}>PKR {hourlyRate.toFixed(0)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.costRow}>
                        <Text style={styles.totalLabel}>Additional Charge</Text>
                        <Text style={styles.totalValue}>PKR {extraCost.toFixed(0)}</Text>
                    </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                    style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
                    onPress={handleConfirmExtend}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[COLORS.green[500], "#34D399"]}
                        style={styles.gradientBtn}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                                <Text style={styles.confirmText}>Confirm Extension</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.navy[900] },

    header: { paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 10 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
    backBtn: { width: 40, height: 40, backgroundColor: COLORS.navy[700], borderRadius: 12, justifyContent: "center", alignItems: "center" },

    scroll: { padding: 20, paddingBottom: 40 },

    card: {
        backgroundColor: COLORS.navy[800],
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.navy[700],
    },
    cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: "700", marginBottom: 16 },
    carName: { color: COLORS.white, fontSize: 18, fontWeight: "700", marginLeft: 12 },

    label: { color: COLORS.gray[400], fontSize: 14, marginBottom: 12 },
    timeValue: { color: COLORS.white, fontSize: 18, fontWeight: "600" },

    hoursSelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
    },
    hourBtn: {
        width: 50,
        height: 50,
        backgroundColor: COLORS.gold[500],
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    hourBtnDisabled: { backgroundColor: COLORS.gray[500], opacity: 0.5 },
    hoursDisplay: { alignItems: "center" },
    hoursValue: { color: COLORS.gold[500], fontSize: 48, fontWeight: "800" },
    hoursLabel: { color: COLORS.gray[400], fontSize: 14 },

    costRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    costLabel: { color: COLORS.gray[400], fontSize: 14 },
    costValue: { color: COLORS.white, fontSize: 14, fontWeight: "600" },

    divider: { height: 1, backgroundColor: COLORS.navy[700], marginVertical: 12 },

    totalLabel: { color: COLORS.gold[500], fontSize: 16, fontWeight: "700" },
    totalValue: { color: COLORS.gold[500], fontSize: 20, fontWeight: "800" },

    confirmBtn: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
    confirmBtnDisabled: { opacity: 0.5 },
    gradientBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
    confirmText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
