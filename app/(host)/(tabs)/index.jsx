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
  Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import carService from "../../../services/carService";
import { useAuth } from "../../../context/AuthContext";
import bookingService from "../../../services/bookingService";
import { getWallet } from "../../../services/walletService";

const { width } = Dimensions.get("window");

// ============================================
// 🎨 PREMIUM THEME
// ============================================
const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
    500: "#2A4A73",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
    100: "#FEF3C7",
  },
  emerald: {
    500: "#10B981",
    400: "#34D399",
  },
  gray: {
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
    300: "#D1D5DB",
  },
  white: "#FFFFFF",
  blue: {
    500: "#3B82F6",
  },
  orange: {
    500: "#F97316",
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
    activeCars: 0,
    totalBookings: 0,
    totalEarnings: 0,
    pendingRequests: 0,
    rating: 5.0,
  });

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      const carResponse = await carService.getMyCars();
      const cars = carResponse.data.cars || [];
      const activeCount = cars.filter((c) => c.isActive).length;

      let bookingCount = 0;
      let pendingCount = 0;
      let walletBalance = 0;

      try {
        const [bookingResponse, walletResponse] = await Promise.all([
          bookingService.getHostBookings(),
          getWallet(),
        ]);

        // Handle Bookings
        const allBookings =
          bookingResponse.data?.items || bookingResponse.items || [];
        bookingCount = allBookings.length;
        pendingCount = allBookings.filter((b) => b.status === "pending").length;

        // Handle Wallet (Available + Pending)
        const wallet = walletResponse.data || walletResponse;
        walletBalance =
          (wallet.balanceAvailable || 0) + (wallet.balancePending || 0);
      } catch (err) {
        console.log("Data fetch failed", err);
      }

      setStats({
        totalCars: cars.length,
        activeCars: activeCount,
        totalBookings: bookingCount,
        totalEarnings: walletBalance,
        pendingRequests: pendingCount,
        rating: 5.0,
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
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
              <View style={styles.avatarContainer}>
                {user?.fullName ? (
                  <Text style={styles.avatarText}>{user.fullName[0]}</Text>
                ) : (
                  <Ionicons name="person" size={20} color={COLORS.navy[900]} />
                )}
              </View>
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

          {/* Premium Wallet Card */}
          <View style={styles.walletContainer}>
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
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceValue}>
                  PKR{" "}
                  {stats.totalEarnings.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>

              <View style={styles.walletFooter}>
                <Text style={styles.walletHolder}>
                  {user?.fullName?.toUpperCase() || "SWIFTRIDE HOST"}
                </Text>
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
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.actionRow}
          >
            <QuickAction
              icon="add-circle"
              label="Add Car"
              onPress={() => router.push("/(host)/car/create")}
              color={COLORS.emerald[500]}
            />
            <QuickAction
              icon="car-sport"
              label="Bookings"
              onPress={() => router.push("/(host)/bookings")}
              color={COLORS.blue[500]}
            />
            <QuickAction
              icon="qr-code-outline"
              label="Scan QR"
              onPress={() => router.push("/(host)/bookings/scan")}
              color={COLORS.gold[500]}
            />
            <QuickAction
              icon="wallet-outline"
              label="Wallet"
              onPress={() => router.push("/(host)/(tabs)/wallet")}
              color={COLORS.purple[500]}
            />
          </ScrollView>

          {/* Analytics Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.gold[500]} />
          ) : (
            <View style={styles.grid}>
              <StatCard
                label="Total Fleet"
                value={stats.totalCars}
                icon="car"
                iconColor={COLORS.blue[500]}
              />
              <StatCard
                label="Active Cars"
                value={stats.activeCars}
                icon="checkmark-circle"
                iconColor={COLORS.emerald[500]}
              />
              <StatCard
                label="Total Bookings"
                value={stats.totalBookings}
                icon="calendar"
                iconColor={COLORS.orange[500]}
              />
              <StatCard
                label="Rating"
                value={stats.rating.toFixed(1)}
                icon="star"
                iconColor={COLORS.gold[500]}
              />
            </View>
          )}

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
          </View>

          <View style={styles.activityContainer}>
            {stats.pendingRequests > 0 ? (
              <ActivityItem
                title="New Request Received"
                subtitle={`You have ${stats.pendingRequests} booking(s) pending approval`}
                time="Action Required"
                icon="alert-circle"
                color={COLORS.gold[500]}
              />
            ) : stats.totalCars === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="garage-open"
                  size={40}
                  color={COLORS.gray[500]}
                />
                <Text style={styles.emptyText}>No activity yet</Text>
                <Text style={styles.emptySub}>
                  Add a car to start your journey
                </Text>
              </View>
            ) : (
              <ActivityItem
                title="System Active"
                subtitle="Your fleet is online and visible to renters"
                time="Now"
                icon="pulse"
                color={COLORS.emerald[500]}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ============================================
// 🧩 COMPONENTS
// ============================================

const QuickAction = ({ icon, label, onPress, color }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <View
      style={[
        styles.actionIconBox,
        { backgroundColor: `${color}20`, borderRadius: 18, overflow: "hidden" },
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const StatCard = ({ label, value, icon, iconColor }) => (
  <View style={styles.statCard}>
    <View style={[styles.statHeader]}>
      <View style={[styles.statIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActivityItem = ({ title, subtitle, time, icon, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySub}>{subtitle}</Text>
    </View>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
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
    borderRadius: 24,
    backgroundColor: COLORS.gold[500],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: COLORS.navy[900], fontSize: 20, fontWeight: "700" },
  greeting: { color: COLORS.gray[400], fontSize: 13 },
  userName: { color: COLORS.white, fontSize: 18, fontWeight: "700" },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    backgroundColor: COLORS.gold[500],
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.navy[900],
  },
  badgeText: { color: COLORS.navy[900], fontSize: 10, fontWeight: "800" },

  // Wallet Card
  walletContainer: {
    marginBottom: 30,
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  walletCard: {
    borderRadius: 24,
    padding: 24,
    paddingVertical: 28,
    position: "relative",
    overflow: "hidden",
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  walletBalance: { marginBottom: 25 },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: 1,
  },
  balanceValue: { color: COLORS.white, fontSize: 32, fontWeight: "800" },
  walletFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  walletHolder: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
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
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },

  // Quick Actions
  actionRow: { marginBottom: 30, paddingHorizontal: 0 },
  actionBtn: { alignItems: "center", marginRight: 20 },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: { color: COLORS.gray[400], fontSize: 12, fontWeight: "500" },

  // Stats Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "700", color: COLORS.white },
  statLabel: { color: COLORS.gray[400], fontSize: 12, fontWeight: "500" },

  // Activity Feed
  activityContainer: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navy[700],
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  activityContent: { flex: 1 },
  activityTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  activitySub: { color: COLORS.gray[400], fontSize: 12 },
  activityTime: { color: COLORS.gold[500], fontSize: 11, fontWeight: "600" },

  // Empty State
  emptyState: { padding: 30, alignItems: "center" },
  emptyText: { color: COLORS.white, marginTop: 10, fontWeight: "700" },
  emptySub: { color: COLORS.gray[500], fontSize: 12, marginTop: 4 },
});
