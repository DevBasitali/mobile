import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  FadeInDown,
  ZoomIn
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// 🎨 Premium Theme
const COLORS = {
  navyDark: '#050B14',
  navyLight: '#0F2137',
  gold: '#F59E0B',
  goldLight: '#FBBF24',
  white: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.6)'
};

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function SplashScreen() {
  const router = useRouter();
  
  // Animation Values
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const loaderRotation = useSharedValue(0);

  useEffect(() => {
    // Start Animations
    iconScale.value = withSpring(1, { damping: 12 });
    textOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    loaderRotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }), 
      -1
    );

    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await SecureStore.getItemAsync(ONBOARDING_KEY);
      
      // Wait for animations and branding impact (2.5s)
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (hasSeenOnboarding === 'true') {
        router.replace('/welcome');
      } else {
        router.replace('/(onboarding)');
      }
    } catch (error) {
      console.log('Error checking status:', error);
      router.replace('/(onboarding)');
    }
  };

  // Reanimated Styles
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }]
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: withTiming(textOpacity.value === 1 ? 0 : 20) }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[COLORS.navyDark, COLORS.navyLight]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <Image 
            source={require('../assets/images/splash-icon.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Text Logo */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Image 
            source={require('../assets/images/splash-logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Premium P2P Car Rental</Text>
        </Animated.View>
      </View>

      {/* Modern Loader */}
      <Animated.View style={[styles.loaderContainer, textStyle]}>
         <View style={styles.loaderLine} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.navyDark,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 180,
    height: 50,
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.textDim,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    width: 40, 
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderLine: {
    flex: 1,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    width: '50%', // Simple indication
  }
});