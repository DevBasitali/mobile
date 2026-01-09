// components/common/UploadProgressModal.jsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
  },
};

export default function UploadProgressModal({ visible, message = "Uploading your documents..." }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Spin animation for the icon
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Pulse animation for the outer ring
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Progress bar animation
      const progress = Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );

      // Animated dots
      const createDotAnimation = (anim, delay) => 
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );

      spin.start();
      pulse.start();
      progress.start();
      createDotAnimation(dotAnim1, 0).start();
      createDotAnimation(dotAnim2, 200).start();
      createDotAnimation(dotAnim3, 400).start();

      return () => {
        spin.stop();
        pulse.stop();
        progress.stop();
      };
    }
  }, [visible]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Animated Icon Container */}
          <Animated.View
            style={[
              styles.iconOuterRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.iconInnerRing}>
              <LinearGradient
                colors={[COLORS.gold[400], COLORS.gold[600]]}
                style={styles.iconGradient}
              >
                <Animated.View
                  style={{ transform: [{ rotate: spinInterpolate }] }}
                >
                  <MaterialCommunityIcons
                    name="cloud-upload"
                    size={40}
                    color={COLORS.navy[900]}
                  />
                </Animated.View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Title with animated dots */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Uploading</Text>
            <View style={styles.dotsContainer}>
              <Animated.Text
                style={[styles.dot, { opacity: dotAnim1 }]}
              >
                .
              </Animated.Text>
              <Animated.Text
                style={[styles.dot, { opacity: dotAnim2 }]}
              >
                .
              </Animated.Text>
              <Animated.Text
                style={[styles.dot, { opacity: dotAnim3 }]}
              >
                .
              </Animated.Text>
            </View>
          </View>

          <Text style={styles.message}>{message}</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                <LinearGradient
                  colors={[COLORS.gold[400], COLORS.gold[600]]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.gold[500]} />
            <Text style={styles.infoText}>Your documents are encrypted & secure</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 22, 40, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: COLORS.navy[800],
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconOuterRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.gold[500] + "30",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconInnerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.gold[500] + "50",
    justifyContent: "center",
    alignItems: "center",
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
  },
  dotsContainer: {
    flexDirection: "row",
    marginLeft: 2,
  },
  dot: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.gold[500],
  },
  message: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.navy[700],
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
});
