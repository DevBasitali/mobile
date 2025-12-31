import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Line,
  Circle,
  Text as SvgText,
} from "react-native-svg";
import api from "../../services/api";
import { useAlert } from "../../context/AlertContext";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  emerald: {
    500: "#10B981",
    400: "#34D399",
  },
  gold: {
    500: "#F59E0B",
    400: "#FBBF24",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
  },
  blue: {
    500: "#3B82F6",
  },
  purple: {
    500: "#8B5CF6",
  },
  rose: {
    500: "#F43F5E",
  },
};

export default function PerformanceAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();

  // Mock data for initial skeleton or fallback
  const mockChartData = Array(6).fill({ label: "", value: 0 });

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await api.get("/analytics/dashboard");
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showAlert({
        title: "Error",
        message: "Failed to load analytics data.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "PKR 0";
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(1)}K`;
    }
    return `PKR ${amount}`;
  };

  // --- Smooth Chart Logic ---
  const Chart = ({ data = [] }) => {
    if (!data || data.length === 0) return null;

    const height = 180;
    const paddingHorizontal = 20;
    const chartWidth = width - 40 - paddingHorizontal * 2; // logic width inside card
    const chartHeight = height - 40;

    const maxValue = Math.max(...data.map((d) => d.value), 1000);
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * chartWidth,
      y: chartHeight - (d.value / maxValue) * chartHeight,
      value: d.value,
      label: d.label,
    }));

    // Generate Smooth Path (Catmull-Rom or simple Bezier approximation)
    // Simple line connection for robustness
    const linePath = points
      .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
      .join(" ");

    // For Area Fill
    const areaPath = `${linePath} L ${
      points[points.length - 1].x
    },${chartHeight} L ${points[0].x},${chartHeight} Z`;

    return (
      <View style={{ height, justifyContent: "center", alignItems: "center" }}>
        <Svg width={chartWidth} height={height}>
          <Defs>
            <SvgLinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={COLORS.emerald[500]}
                stopOpacity="0.4"
              />
              <Stop
                offset="1"
                stopColor={COLORS.emerald[500]}
                stopOpacity="0"
              />
            </SvgLinearGradient>
          </Defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <Line
              key={t}
              x1="0"
              y1={chartHeight * t}
              x2={chartWidth}
              y2={chartHeight * t}
              stroke={COLORS.navy[600]}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Area Fill */}
          <Path d={areaPath} fill="url(#gradient)" />

          {/* Line Stroke */}
          <Path
            d={linePath}
            stroke={COLORS.emerald[400]}
            strokeWidth="3"
            fill="none"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <React.Fragment key={i}>
              <Circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill={COLORS.navy[900]}
                stroke={COLORS.emerald[400]}
                strokeWidth="2"
              />
              {/* Labels (Months) */}
              <SvgText
                x={p.x}
                y={height - 5}
                fontSize="10"
                fill={COLORS.gray[400]}
                textAnchor="middle"
              >
                {p.label}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[COLORS.navy[900], "#050B14"]}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={COLORS.gold[400]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold[500]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold[500]} />
            <Text style={styles.loadingText}>Analyzing your data...</Text>
          </View>
        ) : (
          <>
            {/* Top Cards - Lifetime & Pending */}
            <View style={styles.topCardsRow}>
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                style={styles.flex1}
              >
                <LinearGradient
                  colors={[COLORS.navy[800], COLORS.navy[700]]}
                  style={styles.heroCard}
                >
                  <View style={styles.cardIconRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: "rgba(52, 211, 153, 0.1)" },
                      ]}
                    >
                      <Ionicons
                        name="wallet"
                        size={20}
                        color={COLORS.emerald[400]}
                      />
                    </View>
                    <Text style={styles.heroLabel}>Lifetime Earnings</Text>
                  </View>
                  <Text style={styles.heroValue}>
                    {formatCurrency(data?.stats?.totalEarnings)}
                  </Text>
                </LinearGradient>
              </Animated.View>

              <View style={{ width: 12 }} />

              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={styles.flex1}
              >
                <LinearGradient
                  colors={[COLORS.navy[800], COLORS.navy[700]]}
                  style={styles.heroCard}
                >
                  <View style={styles.cardIconRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: "rgba(251, 191, 36, 0.1)" },
                      ]}
                    >
                      <Ionicons
                        name="time"
                        size={20}
                        color={COLORS.gold[400]}
                      />
                    </View>
                    <Text style={styles.heroLabel}>Pending</Text>
                  </View>
                  <Text style={styles.heroValue}>
                    {formatCurrency(data?.stats?.pendingEarnings)}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Revenue Chart Section */}
            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              style={styles.chartSection}
            >
              <LinearGradient
                colors={[COLORS.navy[800], COLORS.navy[900]]}
                style={styles.chartCard}
              >
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Revenue Trend</Text>
                    <Text style={styles.sectionSubtitle}>
                      Last 6 Months Performance
                    </Text>
                  </View>
                  <View style={styles.trendBadge}>
                    <Ionicons
                      name="trending-up"
                      size={16}
                      color={COLORS.emerald[400]}
                    />
                    <Text style={styles.trendText}>Live</Text>
                  </View>
                </View>

                {/* Chart */}
                <View style={styles.chartWrapper}>
                  {data?.chartData && data.chartData.length > 0 ? (
                    <Chart data={data.chartData} />
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>
                        No revenue data available
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Metrics Grid */}
            <Text style={styles.gridTitle}>Business Overview</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Total Bookings"
                value={data?.stats?.totalBookings}
                icon="calendar"
                color={COLORS.blue[500]}
                delay={400}
              />
              <MetricCard
                label="Completed"
                value={data?.stats?.completedBookings}
                icon="checkmark-circle"
                color={COLORS.purple[500]}
                delay={500}
              />
              <MetricCard
                label="Active Now"
                value={data?.stats?.activeBookings}
                icon="flash"
                color={COLORS.gold[400]}
                delay={600}
              />
              <MetricCard
                label="Fleet Size"
                value={data?.stats?.totalCars}
                icon="car-sport"
                color={COLORS.rose[500]}
                delay={700}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function MetricCard({ label, value, icon, color, delay }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={styles.metricCardWrapper}
    >
      <LinearGradient
        colors={[COLORS.navy[800], COLORS.navy[700]]}
        style={styles.metricCard}
      >
        <View style={[styles.metricIconBox, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.metricValue}>{value || 0}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navy[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.navy[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    marginTop: 100,
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.gray[400],
    marginTop: 12,
    fontSize: 14,
  },

  // Hero Cards
  topCardsRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  flex1: {
    flex: 1,
  },
  heroCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    minHeight: 110,
    justifyContent: "space-between",
  },
  cardIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  heroLabel: {
    color: COLORS.gray[400],
    fontSize: 12,
    fontWeight: "500",
  },
  heroValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 8,
  },

  // Chart
  chartSection: {
    marginBottom: 32,
  },
  chartCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: COLORS.emerald[400],
    fontWeight: "600",
  },
  chartWrapper: {
    alignItems: "center",
  },
  emptyState: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.gray[500],
    fontSize: 14,
  },

  // Grid
  gridTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCardWrapper: {
    width: (width - 52) / 2, // (screen width - padding*2 - gap) / 2
  },
  metricCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    height: 120,
    justifyContent: "space-between",
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    fontWeight: "500",
  },
});
