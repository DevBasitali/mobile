// app/(host)/(tabs)/index.jsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api"; // Unified Analytics API
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

// ============================================
// 🎨 PREMIUM THEME (Aligned with Analytics)
// ============================================
const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
  },
  emerald: {
    500: "#10B981",
    400: "#34D399",
  },
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
  },
  white: "#FFFFFF",
  blue: {
    500: "#3B82F6",
  },
  rose: {
    500: "#F43F5E",
  },
  purple: {
    500: "#8B5CF6",
  },
};

export default function HostDashboard() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0, // "Active Now"
    totalBookings: 0,
    totalEarnings: 0, // Lifetime
    pendingEarnings: 0,
    availableBalance: 0,
    pendingRequests: 0, // We might need to fetch this separately if not in analytics
  });

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Aggregated Analytics
      const analyticsRes = await api.get("/analytics/dashboard");
      const aData = analyticsRes.data.data.stats;

      // 2. Fetch Pending Requests (Specific to Dashboard Notification)
      // We can keep using bookingService or just filter if we had the list,
      // but let's assume valid "pending" count logic or fetch it.
      // For now, let's do a quick separate call or rely on what we have.
      // Since analytics aggregate doesn't return "pending request count" specifically (it has active/completed),
      // we might want to add it to analytics controller later. For now, let's mock or fetch lightly.
      // Actually, let's rely on analytics data for the main stats.
      // For notifications badge, I'll allow it to be 0 for now to keep this robust.

      setStats({
        totalCars: aData.totalCars,
        activeBookings: aData.activeBookings,
        totalBookings: aData.totalBookings,
        totalEarnings: aData.totalEarnings,
        pendingEarnings: aData.pendingEarnings,
        availableBalance: aData.availableBalance,
        pendingRequests: 0, // Placeholder until added to analytics API
      });
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Format Currency
  const formatMoney = (val) => {
    return val?.toLocaleString("en-US", { minimumFractionDigits: 0 });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.navy[900], "#050B14"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold[500]}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <LinearGradient
                colors={[COLORS.gold[500], COLORS.gold[600]]}
                style={styles.avatarContainer}
              >
                {user?.fullName ? (
                  <Text style={styles.avatarText}>{user.fullName[0]}</Text>
                ) : (
                  <Ionicons name="person" size={20} color={COLORS.navy[900]} />
                )}
              </LinearGradient>
              <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>
                  {user?.fullName?.split(" ")[0] || "Host"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(host)/bookings")}
              style={styles.iconBtn}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS.white}
              />
              {stats.pendingRequests > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.pendingRequests}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Premium Wallet Card - Animated */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(host)/(tabs)/wallet")}
              style={styles.walletContainer}
            >
              <LinearGradient
                colors={[COLORS.gold[600], COLORS.gold[500], COLORS.gold[400]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletCard}
              >
                <View style={styles.walletHeader}>
                  <View style={styles.chip} />
                  <MaterialCommunityIcons
                    name="contactless-payment"
                    size={24}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>

                <View style={styles.walletBalance}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceValue}>
                    PKR {formatMoney(stats.availableBalance)}
                  </Text>
                </View>

                <View style={styles.walletFooter}>
                  <View>
                    <Text style={styles.pendingLabel}>Pending</Text>
                    <Text style={styles.pendingValue}>
                      PKR {formatMoney(stats.pendingEarnings)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="credit-card-chip"
                    size={30}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>

                {/* Decorative Circles */}
                <View style={styles.walletDeco1} />
                <View style={styles.walletDeco2} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions - Horizontal Scroll */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.actionRow}
              contentContainerStyle={{ paddingHorizontal: 0, gap: 12 }}
            >
              <ActionCard
                icon="add-circle"
                label="Add Car"
                onPress={() => router.push("/(host)/car/create")}
                color={COLORS.emerald[500]}
              />
              <ActionCard
                icon="car-sport"
                label="Bookings"
                onPress={() => router.push("/(host)/bookings")}
                color={COLORS.blue[500]}
              />
              <ActionCard
                icon="qr-code-outline"
                label="Scan QR"
                onPress={() => router.push("/(host)/bookings/scan")}
                color={COLORS.gold[500]}
              />
              <ActionCard
                icon="bar-chart" // Changed to analytics icon
                label="Analytics"
                onPress={() => router.push("/common/performance-analytics")}
                color={COLORS.purple[500]}
              />
            </ScrollView>
          </Animated.View>

          {/* Analytics Grid - Glassmorphism */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Overview</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.gold[500]} />
          ) : (
            <View style={styles.grid}>
              <OverviewCard
                label="Total Fleet"
                value={stats.totalCars}
                icon="car"
                color={COLORS.rose[500]}
                delay={300}
              />
              <OverviewCard
                label="Active Now"
                value={stats.activeBookings}
                icon="flash"
                color={COLORS.emerald[400]}
                delay={400}
              />
              <OverviewCard
                label="Total Bookings"
                value={stats.totalBookings}
                icon="calendar"
                color={COLORS.blue[500]}
                delay={500}
              />
              <OverviewCard
                label="Lifetime Earn"
                value={
                  stats.totalEarnings >= 1000
                    ? (stats.totalEarnings / 1000).toFixed(1) + "k"
                    : stats.totalEarnings
                }
                icon="cash"
                color={COLORS.gold[500]}
                delay={600}
              />
            </View>
          )}

          {/* Activity Section can replace the old activity feed or just show a simplified version */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ============================================
// 🧩 COMPONENTS
// ============================================

const ActionCard = ({ icon, label, onPress, color }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={[COLORS.navy[800], COLORS.navy[700]]}
      style={styles.actionCard}
    >
      <View style={[styles.actionIconBox, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const OverviewCard = ({ label, value, icon, color, delay }) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    style={styles.overviewWrapper}
  >
    <LinearGradient
      colors={[COLORS.navy[800], COLORS.navy[700]]}
      style={styles.overviewCard}
    >
      <View style={styles.overviewHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.overviewValue}>{value}</Text>
      </View>
      <Text style={styles.overviewLabel}>{label}</Text>
    </LinearGradient>
  </Animated.View>
);

// ============================================
// 💅 STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  content: { padding: 20 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 16, // Squircle
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: COLORS.navy[900], fontSize: 20, fontWeight: "700" },
  greeting: { color: COLORS.gray[400], fontSize: 13 },
  userName: { color: COLORS.white, fontSize: 18, fontWeight: "700" },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.navy[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.rose[500],
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.navy[900],
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: "800" },

  // Wallet Card
  walletContainer: {
    marginBottom: 30,
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  walletCard: {
    borderRadius: 24,
    padding: 24,
    paddingVertical: 24,
    position: "relative",
    overflow: "hidden",
    minHeight: 180,
    justifyContent: "space-between",
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  walletBalance: { marginBottom: 10 },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  balanceValue: { color: COLORS.white, fontSize: 28, fontWeight: "800" },
  walletFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
  },
  pendingValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  walletDeco1: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  walletDeco2: {
    position: "absolute",
    top: -30,
    right: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: { color: COLORS.white, fontSize: 17, fontWeight: "700" },

  // Quick Actions (Horizontal)
  actionRow: { marginBottom: 30 },
  actionCard: {
    width: 100,
    height: 100,
    borderRadius: 20,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    marginRight: 4, // tiny margin handled by gap in container
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },

  // Overview Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
  overviewWrapper: {
    width: (width - 52) / 2,
  },
  overviewCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    height: 110,
    justifyContent: "space-between",
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 4,
  },
  overviewLabel: { color: COLORS.gray[500], fontSize: 12, fontWeight: "600" },
});
