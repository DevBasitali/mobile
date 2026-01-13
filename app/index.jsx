import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

// Same colors as splash screen
const COLORS = {
  background: '#0A1628',
  cardDark: '#0F2137',
  gold: '#F59E0B',
  white: '#FFFFFF',
  gray: '#94A3B8',
};

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show same design as splash screen while loading
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.background, COLORS.cardDark]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.brandText}>
          SWIFT<Text style={styles.brandAccent}>RIDE</Text>
        </Text>
      </View>
    );
  }

  // ✅ 1. If Logged In: Go to Dashboard
  if (user) {
    return user.role === 'host' || user.role === 'showroom' 
      ? <Redirect href="/(host)/(tabs)" /> 
      : <Redirect href="/(customer)/(tabs)" />;
  }

  // ✅ 2. If Not Logged In: Start the App Flow (Splash -> Onboarding)
  return <Redirect href="/splash" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
});