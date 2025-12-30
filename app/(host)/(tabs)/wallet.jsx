import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWallet, getTransactions } from '../../../services/walletService';

// 🎨 Swift Ride Premium Theme
const COLORS = {
  background: '#0A1628',
  card: '#1E3A5F',
  gold: '#F59E0B',
  goldDark: '#D97706',
  white: '#FFFFFF',
  gray: '#94A3B8',
  success: '#10B981',
  danger: '#EF4444',
  border: '#2A4A73'
};

export default function HostWallet() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const fetchWalletData = async () => {
    try {
      setError(null);
      const [walletRes, txRes] = await Promise.all([
        getWallet(),
        getTransactions(20)
      ]);

      // Handle wallet response
      const walletData = walletRes?.data || walletRes;
      setWallet(walletData);

      // Handle transactions response
      const txData = txRes?.data?.items || txRes?.items || [];
      setTransactions(txData);
    } catch (err) {
      console.log('Wallet fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletData();
  }, []);

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0.00';
    return `PKR ${Number(amount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTransactionType = (tx) => {
    if (tx.type === 'payout') return 'debit';
    return 'credit'; // earning or adjustment (positive)
  };

  const getTransactionTitle = (tx) => {
    if (tx.type === 'earning') {
      return `Booking Earning ${tx.status === 'pending' ? '(Pending)' : ''}`;
    }
    if (tx.type === 'payout') return 'Withdrawal to Bank';
    return tx.description || 'Transaction';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
        }
      >

        {/* 💳 PREMIUM BALANCE CARD */}
        <LinearGradient
          colors={[COLORS.gold, COLORS.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Available Balance</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              <Ionicons
                name={balanceVisible ? "eye" : "eye-off"}
                size={20}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {balanceVisible ? formatAmount(wallet?.balanceAvailable) : '•••••••'}
          </Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>Pending</Text>
              <Text style={styles.footerValue}>
                {balanceVisible ? formatAmount(wallet?.balancePending) : '•••••'}
              </Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="wallet-outline" size={14} color={COLORS.white} />
              <Text style={styles.chipText}> {wallet?.currency || 'PKR'}</Text>
            </View>
          </View>

          {/* Decorative Circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </LinearGradient>

        {/* ⚡ QUICK ACTIONS */}
        <View style={styles.actionsContainer}>
          <ActionButton icon="arrow-down-circle-outline" label="Withdraw" />
          <ActionButton icon="document-text-outline" label="Statement" />
          <ActionButton icon="card-outline" label="Cards" />
          <ActionButton icon="settings-outline" label="Settings" />
        </View>

        {/* 📝 RECENT TRANSACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Failed to load transactions</Text>
          </View>
        )}

        {transactions.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Your earnings will appear here</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((item) => {
              const txType = getTransactionType(item);
              return (
                <View key={item.id || item._id} style={styles.transactionItem}>
                  <View style={styles.transLeft}>
                    <View style={[styles.iconBox, txType === 'debit' ? styles.debitIcon : styles.creditIcon]}>
                      <Ionicons
                        name={txType === 'credit' ? "arrow-down" : "arrow-up"}
                        size={18}
                        color={COLORS.white}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.transTitle}>{getTransactionTitle(item)}</Text>
                      <Text style={styles.transDate}>{formatDate(item.createdAt)}</Text>
                      {item.status === 'pending' && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingText}>Pending</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.transAmount, txType === 'credit' ? styles.textSuccess : styles.textDanger]}>
                    {txType === 'credit' ? '+' : '-'}{formatAmount(item.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component for Buttons
const ActionButton = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionBtn}>
    <View style={styles.actionIconBox}>
      <Ionicons name={icon} size={24} color={COLORS.gold} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.gray,
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Balance Card
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  footerValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionBtn: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconBox: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '500',
  },

  // Transactions
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  seeAll: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditIcon: {
    backgroundColor: COLORS.success,
  },
  debitIcon: {
    backgroundColor: COLORS.danger,
  },
  transTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transDate: {
    color: COLORS.gray,
    fontSize: 12,
  },
  transAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textSuccess: {
    color: COLORS.success,
  },
  textDanger: {
    color: COLORS.danger,
  },
  pendingBadge: {
    backgroundColor: COLORS.gold + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: COLORS.danger + '20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
  },
});