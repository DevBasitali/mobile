import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  background: '#0A1628',
  gold: '#F59E0B',
  white: '#FFFFFF',
  textDim: '#64748B'
};

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function SplashScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // Check if user has seen onboarding before
      const hasSeenOnboarding = await SecureStore.getItemAsync(ONBOARDING_KEY);

      // Wait minimum splash time for branding
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (hasSeenOnboarding === 'true') {
        // Returning user - skip to welcome/login screen
        router.replace('/welcome');
      } else {
        // First-time user - show onboarding
        router.replace('/(onboarding)');
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      // On error, show onboarding to be safe
      router.replace('/(onboarding)');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          SWIFT<Text style={styles.logoAccent}>RIDE</Text>
        </Text>
        <Text style={styles.tagline}>Premium P2P Car Rental</Text>
      </View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
  },
  logoAccent: {
    color: COLORS.gold,
  },
  tagline: {
    color: COLORS.textDim,
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 1,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
  }
});