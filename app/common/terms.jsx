import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
  },
  gold: {
    500: "#F59E0B",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
    300: "#D1D5DB",
  },
};

export default function Terms() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.lastUpdated}>
            Last Updated: December 31, 2025
          </Text>

          <Text style={styles.heading}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Swiftride. By using our app, you agree to these Terms and
            Conditions. Please read them carefully.
          </Text>

          <Text style={styles.heading}>2. User Accounts</Text>
          <Text style={styles.paragraph}>
            You must be at least 18 years old to create an account. You are
            responsible for maintaining the confidentiality of your account and
            password.
          </Text>

          <Text style={styles.heading}>3. Car Rentals</Text>
          <Text style={styles.paragraph}>
            Swiftride provides a platform for users to rent vehicles from hosts.
            We are not a car rental agency. Hosts are responsible for the
            condition and safety of their vehicles.
          </Text>

          <Text style={styles.heading}>4. Payments</Text>
          <Text style={styles.paragraph}>
            Payments are processed securely through our platform. You agree to
            pay all fees associated with your rental, including any applicable
            taxes and insurance costs.
          </Text>

          <Text style={styles.heading}>5. Cancellation Policy</Text>
          <Text style={styles.paragraph}>
            Cancellations are subject to the host's specific cancellation
            policy. Swiftride may charge a service fee for cancellations.
          </Text>

          <Text style={styles.heading}>6. Prohibited Activities</Text>
          <Text style={styles.paragraph}>
            You may not use the app for any illegal or unauthorized purpose. You
            agree not to violate any laws in your jurisdiction.
          </Text>

          <Text style={styles.heading}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            Swiftride is not liable for any damages arising from your use of the
            app or any vehicle rented through the platform.
          </Text>

          <Text style={styles.heading}>8. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Your
            continued use of the app constitutes acceptance of those changes.
          </Text>

          <Text style={styles.heading}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at
            legal@swiftride.com.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.navy[700],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.navy[800],
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.gold[500],
    marginBottom: 20,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.gray[400],
    lineHeight: 22,
  },
});
