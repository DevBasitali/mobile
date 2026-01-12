import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useAlert } from "../../context/AlertContext";

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  purple: {
    500: "#8B5CF6",
    600: "#7C3AED",
  },
  green: {
    500: "#10B981",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
  },
};

export default function EarningsReport() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes] = await Promise.all([
        api.get("/wallets/me"),
        api.get("/wallets/me/transactions"),
      ]);

      setWallet(walletRes.data.data);
      setTransactions(transactionsRes.data.data.items || []);
    } catch (error) {
      console.error("Error fetching earnings data:", error);
      showAlert({
        title: "Error",
        message: "Failed to load earnings data. Please try again.",
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
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "earning":
        return "arrow-down-circle";
      case "payout":
        return "arrow-up-circle";
      default:
        return "swap-horizontal";
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "earning":
        return COLORS.green[500];
      case "payout":
        return COLORS.white; // or red if you prefer
      default:
        return COLORS.gray[400];
    }
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
        <Text style={styles.headerTitle}>Earnings Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.white}
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.purple[500]} />
        ) : (
          <>
            {/* Balance Card */}
            <LinearGradient
              colors={[COLORS.purple[500], COLORS.purple[600]]}
              style={styles.balanceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(wallet?.balanceAvailable || 0)}
              </Text>
              <View style={styles.pendingContainer}>
                <Text style={styles.pendingLabel}>Pending: </Text>
                <Text style={styles.pendingAmount}>
                  {formatCurrency(wallet?.balancePending || 0)}
                </Text>
              </View>
            </LinearGradient>

            {/* Transactions */}
            <Text style={styles.sectionTitle}>Recent Transactions</Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={COLORS.gray[500]}
                />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                {transactions.map((tx) => (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={styles.txLeft}>
                      <View style={styles.txIconBox}>
                        <Ionicons
                          name={getTransactionIcon(tx.type)}
                          size={24}
                          color={getTransactionColor(tx.type)}
                        />
                      </View>
                      <View>
                        <Text style={styles.txDescription}>
                          {tx.status.charAt(0).toUpperCase() +
                            tx.status.slice(1)}
                        </Text>
                        <Text style={styles.txDate}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: getTransactionColor(tx.type) },
                      ]}
                    >
                      {tx.type === "earning" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: COLORS.purple[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 16,
  },
  pendingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  pendingAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    opacity: 0.7,
  },
  emptyStateText: {
    color: COLORS.gray[400],
    marginTop: 12,
    fontSize: 16,
  },
});
