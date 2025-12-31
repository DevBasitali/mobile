import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAlert } from "../../context/AlertContext";
import authService from "../../services/authService";

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
    500: "#2A4A73",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
  },
  gray: {
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
  black: "#000000",
  red: { 500: "#EF4444" },
};

export default function ChangePassword() {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleShowPassword = (key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showAlert({
        title: "Error",
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 8) {
      showAlert({
        title: "Weak Password",
        message: "New password must be at least 8 characters long",
        type: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        title: "Mismatch",
        message: "New passwords do not match",
        type: "error",
      });
      return;
    }

    if (oldPassword === newPassword) {
      showAlert({
        title: "No Change",
        message: "New password cannot be the same as the old password",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      showAlert({
        title: "Success",
        message: "Password changed successfully",
        type: "success",
        buttons: [{ text: "OK", onPress: () => router.back() }],
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Failed to change password",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.formContainer}>
            {/* Old Password */}
            <InputGroup
              label="Old Password"
              value={form.oldPassword}
              onChangeText={(text) => handleChange("oldPassword", text)}
              secureTextEntry={!showPassword.old}
              onToggleShow={() => toggleShowPassword("old")}
              placeholder="Enter current password"
            />

            {/* New Password */}
            <InputGroup
              label="New Password"
              value={form.newPassword}
              onChangeText={(text) => handleChange("newPassword", text)}
              secureTextEntry={!showPassword.new}
              onToggleShow={() => toggleShowPassword("new")}
              placeholder="Min. 8 characters"
            />

            {/* Confirm Password */}
            <InputGroup
              label="Confirm New Password"
              value={form.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              secureTextEntry={!showPassword.confirm}
              onToggleShow={() => toggleShowPassword("confirm")}
              placeholder="Re-enter new password"
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={
                  isSubmitting
                    ? [COLORS.gray[600], COLORS.gray[600]]
                    : [COLORS.gold[500], COLORS.gold[600]]
                }
                style={styles.btnGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.navy[900]} />
                ) : (
                  <Text style={styles.btnText}>Update Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputGroup({
  label,
  value,
  onChangeText,
  secureTextEntry,
  onToggleShow,
  placeholder,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={COLORS.gray[400]}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[500]}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShow}>
          <Ionicons
            name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.gray[400]}
          />
        </TouchableOpacity>
      </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
    marginTop: 20,
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
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[800],
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnGradient: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy[900],
  },
});
