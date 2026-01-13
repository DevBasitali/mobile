import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// 🎨 App Theme Colors (Matching the rest of the app)
const COLORS = {
  background: '#0A1628',
  cardDark: '#0F2137',
  gold: '#F59E0B',
  goldDark: '#D97706',
  white: '#FFFFFF',
  gray: '#94A3B8',
};

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await SecureStore.getItemAsync(ONBOARDING_KEY);
      
      // Wait for branding impact
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (hasSeenOnboarding === 'true') {
        router.replace('/welcome');
      } else {
        router.replace('/(onboarding)');
      }
    } catch (error) {
      console.log('Error:', error);
      router.replace('/(onboarding)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.background, COLORS.cardDark]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Gold Accent Line */}
      <Animated.View 
        entering={FadeIn.delay(200).duration(600)}
        style={styles.accentLine}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Brand Name */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(800).springify()}
          style={styles.brandContainer}
        >
          <Text style={styles.brandText}>
            SWIFT<Text style={styles.brandAccent}>RIDE</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text 
          entering={FadeIn.delay(600).duration(600)}
          style={styles.tagline}
        >
          Premium P2P Car Rental
        </Animated.Text>
      </View>

      {/* Bottom Loader */}
      <Animated.View 
        entering={FadeInDown.delay(800).duration(600)}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="small" color={COLORS.gold} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  accentLine: {
    position: 'absolute',
    top: height * 0.15,
    width: 60,
    height: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    marginBottom: 16,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 4,
  },
  brandAccent: {
    color: COLORS.gold,
  },
  tagline: {
    color: COLORS.gray,
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '500',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
  },
});