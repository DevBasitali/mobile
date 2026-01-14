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
  Image,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
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
  red: { 500: "#EF4444" },
};

export default function EditProfile() {
  const { user, updateUser, refreshUser } = useAuth();
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showAlert({
        title: "Permission Denied",
        message: "Sorry, we need camera roll permissions to make this work!",
        type: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.phoneNumber) {
      showAlert({
        title: "Missing Information",
        message: "Please fill in all required fields.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update Text Details
      console.log("Updating profile text details...");
      await authService.updateProfile({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
      });

      // 2. Update Profile Picture (if selected)
      if (selectedImage) {
        console.log("Uploading profile picture...", selectedImage);
        const formData = new FormData();
        const filename = selectedImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: selectedImage,
          name: filename,
          type,
        });

        const uploadRes = await authService.updateProfilePicture(formData);
        console.log("Upload Response:", JSON.stringify(uploadRes));
      }

      // Refresh User Context
      if (refreshUser) {
        console.log("Refreshing user context...");
        await refreshUser();
      }

      showAlert({
        title: "Success",
        message: "Profile updated successfully",
        type: "success",
        buttons: [{ text: "OK", onPress: () => router.back() }],
      });
    } catch (error) {
      console.error("Update profile error:", error);
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Failed to update profile",
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
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Profile Picture Section */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.avatar} />
              ) : user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Text style={styles.avatarInitials}>
                    {form.fullName?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color={COLORS.navy[900]} />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Email (Read-only) */}
            <InputGroup
              label="Email Address"
              value={form.email}
              editable={false}
              icon="mail-outline"
            />

            {/* Full Name */}
            <InputGroup
              label="Full Name"
              value={form.fullName}
              onChangeText={(text) => handleChange("fullName", text)}
              icon="person-outline"
              placeholder="Enter full name"
            />

            {/* Phone Number */}
            <InputGroup
              label="Phone Number"
              value={form.phoneNumber}
              onChangeText={(text) => handleChange("phoneNumber", text)}
              icon="call-outline"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
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
                  <Text style={styles.btnText}>Save Changes</Text>
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
  editable = true,
  icon,
  placeholder,
  keyboardType = "default",
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          !editable && { backgroundColor: COLORS.navy[700], opacity: 0.8 },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={editable ? COLORS.gold[500] : COLORS.gray[500]}
        />
        <TextInput
          style={[styles.input, !editable && { color: COLORS.gray[400] }]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[500]}
          keyboardType={keyboardType}
        />
        {!editable && (
          <Ionicons name="lock-closed" size={16} color={COLORS.gray[500]} />
        )}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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

  // Avatar Styles
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.gold[500],
  },
  placeholderAvatar: {
    backgroundColor: COLORS.navy[700],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.gold[500],
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.gold[500],
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.navy[900],
  },
  changePhotoText: {
    color: COLORS.gold[500],
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
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
