import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  gold: {
    500: "#F59E0B",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
  },
};

const FAQS = [
  {
    question: "How do I book a car?",
    answer:
      "To book a car, browse the available listings, select a car that suits your needs, choose your dates, and proceed to checkout. You'll need to complete your profile verification first.",
  },
  {
    question: "What documents are required?",
    answer:
      "We require a valid driver's license, a government-issued ID (like a passport or national ID), and a selfie for verification.",
  },
  {
    question: "How do I contact the host?",
    answer:
      "Once your booking is confirmed, you can coordinate pickup and drop-off details with the host using the contact information provided in your booking details.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel your booking. Refunds depend on the host's cancellation policy and how far in advance you cancel.",
  },
  {
    question: "Is insurance included?",
    answer:
      "Basic insurance is included with every booking. You can view specific coverage details on the car's listing page.",
  },
];

export default function HelpCenter() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@swiftride.com?subject=Support Request");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Support Section */}
        <View style={styles.contactContainer}>
          <Text style={styles.sectionTitle}>Need Assistance?</Text>
          <Text style={styles.contactDesc}>
            Our support team is available 24/7 to assist you.
          </Text>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={handleContactSupport}
          >
            <LinearGradient
              colors={[COLORS.gold[500], "#D97706"]}
              style={styles.contactBtnGradient}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.navy[900]}
              />
              <Text style={styles.contactBtnText}>Contact Support</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          Frequently Asked Questions
        </Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.gold[500]}
                />
              </TouchableOpacity>
              {expandedIndex === index && (
                <View style={styles.faqBody}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  contactContainer: {
    backgroundColor: COLORS.navy[800],
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 8,
  },
  contactDesc: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: "center",
    marginBottom: 20,
  },
  contactBtn: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  contactBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
  },
  contactBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy[900],
  },
  faqList: {
    gap: 12,
    marginTop: 12,
  },
  faqItem: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    flex: 1,
    marginRight: 10,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
    paddingTop: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.gray[400],
    lineHeight: 22,
  },
});
