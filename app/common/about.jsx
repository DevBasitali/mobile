import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Platform,
  Linking,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  gold: {
    500: "#F59E0B",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
  },
};

export default function About() {
  const openLink = (url) => {
    Linking.openURL(url);
  };

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
        <Text style={styles.headerTitle}>About App</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          {/* You can replace this with your actual logo image if available */}
          <LinearGradient
            colors={[COLORS.gold[500], "#D97706"]}
            style={styles.logoPlaceholder}
          >
            <Ionicons name="car-sport" size={48} color={COLORS.navy[900]} />
          </LinearGradient>
          <Text style={styles.appName}>Swiftride</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>
            Swiftride is the world's leading car sharing marketplace, where you
            can book any car you want, wherever you want it, from a vibrant
            community of trusted hosts across the country.
          </Text>

          <Text style={[styles.description, { marginTop: 12 }]}>
            Whether you're flying in from afar or looking for a car down the
            street, searching for a rugged truck or something smooth and swanky,
            guests can take the wheel of the perfect car for any occasion, while
            hosts can take the wheel of their futures by building an accessible,
            flexible, and scalable car sharing business from the ground up.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Follow Us</Text>
        <View style={styles.socialContainer}>
          <SocialButton
            icon="facebook"
            color="#1877F2"
            onPress={() => openLink("https://facebook.com")}
          />
          <SocialButton
            icon="twitter"
            color="#1DA1F2"
            onPress={() => openLink("https://twitter.com")}
          />
          <SocialButton
            icon="instagram"
            color="#E4405F"
            onPress={() => openLink("https://instagram.com")}
          />
          <SocialButton
            icon="linkedin"
            color="#0A66C2"
            onPress={() => openLink("https://linkedin.com")}
          />
        </View>

        <Text style={styles.copyright}>© 2025 Swiftride Inc.</Text>
      </ScrollView>
    </View>
  );
}

function SocialButton({ icon, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.socialBtn, { backgroundColor: color + "20" }]}
      onPress={onPress}
    >
      <FontAwesome name={icon} size={24} color={color} />
    </TouchableOpacity>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    transform: [{ rotate: "-10deg" }],
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 1,
  },
  version: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.navy[800],
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 32,
  },
  description: {
    fontSize: 15,
    color: COLORS.gray[400],
    lineHeight: 24,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 40,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  copyright: {
    textAlign: "center",
    color: COLORS.gray[500],
    fontSize: 12,
  },
});
