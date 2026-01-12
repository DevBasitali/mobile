import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Theme matching wallet.jsx
const COLORS = {
  background: '#0A1628',
  card: '#1E3A5F',
  gold: '#F59E0B',
  goldDark: '#D97706',
  white: '#FFFFFF',
  gray: '#94A3B8',
  success: '#10B981',
  danger: '#EF4444',
  border: '#2A4A73',
};

export default function WithdrawalModal({ visible, onClose, onSubmit, maxAmount = 0, loading = false }) {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    // Validation
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount > maxAmount) {
      setError(`Amount exceeds available balance (PKR ${maxAmount.toLocaleString()})`);
      return;
    }
    if (numAmount < 500) {
      setError('Minimum withdrawal amount is PKR 500');
      return;
    }
    if (!bankName.trim()) {
      setError('Please enter bank name');
      return;
    }
    if (!accountTitle.trim()) {
      setError('Please enter account title');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please enter account number');
      return;
    }

    onSubmit({
      amount: numAmount,
      bankDetails: {
        bankName: bankName.trim(),
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        iban: iban.trim() || undefined,
      },
    });
  };

  const handleClose = () => {
    // Reset form
    setAmount('');
    setBankName('');
    setAccountTitle('');
    setAccountNumber('');
    setIban('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Withdraw Funds</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View style={styles.amountSection}>
              <Text style={styles.label}>Amount (PKR)</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>PKR</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              <Text style={styles.helperText}>
                Available: PKR {maxAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Bank Details Section */}
            <Text style={styles.sectionTitle}>Bank Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name *</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g., HBL, Meezan Bank"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Title *</Text>
              <TextInput
                style={styles.input}
                value={accountTitle}
                onChangeText={setAccountTitle}
                placeholder="Account holder name"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number *</Text>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Your bank account number"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IBAN (Optional)</Text>
              <TextInput
                style={styles.input}
                value={iban}
                onChangeText={setIban}
                placeholder="PK36HABB0000111222333444"
                placeholderTextColor={COLORS.gray}
                autoCapitalize="characters"
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Info Notice */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.gold} />
              <Text style={styles.infoText}>
                Withdrawals are processed within 2-3 business days after admin approval.
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? [COLORS.gray, COLORS.gray] : [COLORS.gold, COLORS.goldDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="arrow-down-circle" size={20} color={COLORS.white} />
                  <Text style={styles.submitText}>Request Withdrawal</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  currencySymbol: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    paddingVertical: 16,
  },
  helperText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.white,
    fontSize: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '20',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.gold + '15',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    color: COLORS.gold,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
