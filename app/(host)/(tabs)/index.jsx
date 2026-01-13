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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import bookingService from "../../../services/bookingService"; // ✅ Imported Booking Service
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import FloatingChatButton from "../../../components/FloatingChatButton";

const { width } = Dimensions.get("window");

// ============================================
// 🎨 PREMIUM THEME 2.0
// ============================================
const COLORS = {
  navy: {
    950: "#020617",
    900: "#0A1628",
    800: "#0F2137",
    700: "#1E293B",
  },
  gold: {
    600: "#D97706",
    500: "#F59E0B",
    400: "#FBBF24",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  emerald: {
    500: "#10B981",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  rose: {
    500: "#F43F5E",
    glow: "rgba(244, 63, 94, 0.4)",
  },
  blue: {
    500: "#3B82F6",
  },
  white: "#FFFFFF",
  gray: {
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
  },
};

export default function HostDashboard() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    totalBookings: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    availableBalance: 0,
    pendingRequests: 0,
  });

  const [tips] = useState([
    {
      id: 1,
      title: "Boost Your Earnings",
      desc: "Enable instant booking to get 30% more reservations.",
      icon: "flash",
      color: COLORS.gold[500],
    },
    {
      id: 2,
      title: "Superhost Status",
      desc: "Maintain a 4.8 rating to unlock premium badges.",
      icon: "trophy",
      color: COLORS.blue[500],
    },
    {
      id: 3,
      title: "Clean Cars Matter",
      desc: "uploaded photos of clean exterior increases booking.",
      icon: "images-outline",
      color: COLORS.emerald[500],
    },
  ]);

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

      // 2. Fetch Pending Requests using Booking Service
      let pendingReqs = 0;
      try {
        const bookingsRes = await bookingService.getHostBookings(); 
        const bookings = bookingsRes.data || []; // Assuming response structure { data: [...] } or array
        // Flexible fallback based on actual response structure if wrapper exists
        const bookingList = Array.isArray(bookings) ? bookings : bookings.bookings || []; 
        
        pendingReqs = bookingList.filter(b => b.status === "pending").length;
      } catch (bkErr) {
        console.log("Error fetching bookings for badge:", bkErr);
        pendingReqs = user?.pendingRequests || 0; // Fallback
      }

      setStats({
        totalCars: aData.totalCars,
        activeBookings: aData.activeBookings,
        totalBookings: aData.totalBookings,
        totalEarnings: aData.totalEarnings,
        pendingEarnings: aData.pendingEarnings,
        availableBalance: aData.availableBalance,
        pendingRequests: pendingReqs,
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

  const formatMoney = (val) => {
    return val?.toLocaleString("en-US", { minimumFractionDigits: 0 });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[950]} />

      {/* Decorative Background Glows */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(host)/(tabs)/profile")}
            style={styles.userInfo}
          >
            <LinearGradient
              colors={[COLORS.gold[500], COLORS.gold[600]]}
              style={styles.avatarBorder}
            >
              <Image
                source={{
                  uri: user?.profilePicture || "https://ui-avatars.com/api/?name=" + (user?.fullName || "Host"),
                }}
                style={styles.avatarImage}
              />
            </LinearGradient>
            <View>
              <Text style={styles.greeting}>Good Evening,</Text>
              <Text style={styles.userName}>
                {user?.fullName?.split(" ")[0] || "Host"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/(host)/bookings")}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {stats.pendingRequests > 0 && <View style={styles.dot} />}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold[500]}
            />
          }
        >
          {loading ? (
             <View style={{ marginTop: 50 }}>
              <ActivityIndicator size="large" color={COLORS.gold[500]} />
            </View>
          ) : (
            <View style={styles.content}>
              
              {/* 🚨 ACTION CENTER */}
              {stats.pendingRequests > 0 && (
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                  <TouchableOpacity 
                    style={styles.alertCard}
                    onPress={() => router.push("/(host)/bookings")}
                  >
                    <LinearGradient
                      colors={[COLORS.rose[500], "#E11D48"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.alertGradient}
                    >
                      <View style={styles.alertIcon}>
                        <Ionicons name="alert-circle" size={24} color={COLORS.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertTitle}>Action Required</Text>
                        <Text style={styles.alertDesc}>
                          {stats.pendingRequests} booking request{stats.pendingRequests > 1 ? 's' : ''} pending approval
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* 💰 PREMIUM EARNINGS CARD */}
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push("/(host)/(tabs)/wallet")}
                >
                  <LinearGradient
                    colors={[COLORS.navy[800], COLORS.navy[900]]}
                    style={styles.mainCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Glass Effect Overlay */}
                    <View style={styles.glassOverlay} />
                    
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardLabel}>Total Balance</Text>
                      <View style={styles.proBadge}>
                        <Text style={styles.proText}>PRO</Text>
                      </View>
                    </View>

                    <Text style={styles.mainBalance}>
                      <Text style={styles.currency}>PKR</Text>{" "}
                      {formatMoney(stats.availableBalance)}
                    </Text>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardRow}>
                      <View>
                        <Text style={styles.subLabel}>Pending Earnings</Text>
                        <Text style={styles.subValue}>
                          PKR {formatMoney(stats.pendingEarnings)}
                        </Text>
                      </View>
                       <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.subLabel}>Lifetime</Text>
                        <Text style={styles.subValue}>
                          PKR {(stats.totalEarnings / 1000).toFixed(1)}k
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardGlow} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* ⚡ QUICK STATS GRID (Clickable) */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Business Overview</Text>
              </View>

              <View style={styles.grid}>
                <OverviewCard 
                  label="Active Now"
                  value={stats.activeBookings}
                  icon="flash"
                  color={COLORS.emerald[500]}
                  delay={300}
                  onPress={() => router.push("/(host)/bookings")}
                />
                <OverviewCard 
                  label="Total Fleet"
                  value={stats.totalCars}
                  icon="car-sport"
                  color={COLORS.blue[500]}
                  delay={400}
                  onPress={() => router.push("/(host)/(tabs)/fleet")}
                />
                <OverviewCard 
                  label="Total Trips"
                  value={stats.totalBookings}
                  icon="map" // or list
                  color={COLORS.gold[500]}
                  delay={500}
                  onPress={() => router.push("/(host)/bookings")}
                />
                <OverviewCard 
                  label="Earnings"
                  value="Report"
                  icon="bar-chart"
                  color={COLORS.rose[500]}
                  delay={600}
                  onPress={() => router.push("/common/earnings-report")} // Direct to report
                />
              </View>

              {/* 📢 PRO TIPS CAROUSEL */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pro Tips for Hosts</Text>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20, gap: 16 }}
              >
                {tips.map((tip, index) => (
                  <Animated.View 
                    key={tip.id} 
                    entering={FadeInDown.delay(700 + (index * 100)).springify()}
                  >
                    <LinearGradient
                      colors={[COLORS.navy[800], COLORS.navy[800]]}
                      style={styles.tipCard}
                    >
                      <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
                        <Ionicons name={tip.icon} size={20} color={tip.color} />
                      </View>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipDesc}>{tip.desc}</Text>
                    </LinearGradient>
                  </Animated.View>
                ))}
              </ScrollView>

            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <FloatingChatButton />
    </View>
  );
}

// 🧩 SUB-COMPONENTS
const OverviewCard = ({ label, value, icon, color, delay, onPress }) => (
  <Animated.View 
    style={styles.statCardWrapper}
    entering={FadeInDown.delay(delay).springify()}
  >
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={[COLORS.navy[800], "#162032"]}
        style={styles.statCard}
      >
        <View style={[styles.statIconBox, { shadowColor: color }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[950],
  },
  glowTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: COLORS.navy[800],
    borderRadius: 150,
    opacity: 0.5,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: COLORS.gold[600],
    borderRadius: 150,
    opacity: 0.1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarBorder: {
    padding: 2,
    borderRadius: 14,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navy[800],
  },
  greeting: {
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: "500",
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.navy[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.rose[500],
    borderWidth: 1,
    borderColor: COLORS.navy[800],
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  // ACTION ALERT
  alertCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.rose[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  alertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  alertDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  // MAIN CARD
  mainCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    marginBottom: 30,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    backgroundColor: COLORS.gold[500],
    opacity: 0.15,
    blurRadius: 50,
    borderRadius: 50,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    color: COLORS.gray[400],
    fontSize: 14,
    fontWeight: '500',
  },
  proBadge: {
    backgroundColor: COLORS.gold[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proText: {
    color: COLORS.navy[950],
    fontSize: 10,
    fontWeight: '800',
  },
  mainBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  currency: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.gold[500],
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.navy[700],
    marginVertical: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subLabel: {
    color: COLORS.gray[500],
    fontSize: 12,
    marginBottom: 4,
  },
  subValue: {
    color: COLORS.gray[300],
    fontSize: 15,
    fontWeight: '600',
  },
  // STATS GRID
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCardWrapper: {
    width: (width - 52) / 2,
  },
  statCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[800],
    height: 110,
    justifyContent: 'space-between',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.navy[900],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  statLabel: {
    color: COLORS.gray[500],
    fontSize: 12,
    fontWeight: '500',
  },
  // TIPS
  tipCard: {
    width: 200,
    height: 140,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    justifyContent: 'space-between',
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
    marginTop: 8,
  },
  tipDesc: {
    color: COLORS.gray[400],
    fontSize: 11,
    lineHeight: 16,
  },
});


