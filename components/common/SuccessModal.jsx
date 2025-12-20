import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  navy: {
    900: '#0A1628',
    800: '#0F2137',
    700: '#152A46',
  },
  gold: {
    500: '#F59E0B',
    400: '#FBBF24',
  },
  emerald: {
    500: '#10B981',
  },
  gray: {
    400: '#9CA3AF',
    500: '#6B7280',
  },
  white: '#FFFFFF',
};

export default function SuccessModal({ visible, title, message, onNext, onSkip, buttonText = "Continue", showSkip = false }) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Icon */}
          <View style={styles.iconCircleOuter}>
            <LinearGradient
              colors={[COLORS.emerald[500], '#059669']}
              style={styles.iconCircle}
            >
              <Ionicons name="checkmark-circle" size={60} color={COLORS.white} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Primary Action Button */}
          <TouchableOpacity style={styles.btnWrapper} onPress={onNext} activeOpacity={0.9}>
            <LinearGradient
              colors={[COLORS.gold[400], COLORS.gold[500]]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>{buttonText}</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.navy[900]} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Button (if enabled) */}
          {showSkip && onSkip && (
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>I'll do this later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal >
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.88,
    backgroundColor: COLORS.navy[800],
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    elevation: 20,
    shadowColor: COLORS.gold[500],
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  iconCircleOuter: {
    marginTop: -60,
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.navy[800],
    shadowColor: COLORS.emerald[500],
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  btnWrapper: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: {
    color: COLORS.navy[900],
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: 16,
    paddingVertical: 12,
  },
  skipBtnText: {
    color: COLORS.gray[400],
    fontSize: 14,
    fontWeight: '500',
  },
});