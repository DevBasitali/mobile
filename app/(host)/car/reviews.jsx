import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCarReviews } from "../../../services/reviewService";

const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46", 600: "#1E3A5F" },
  gold: { 500: "#F59E0B", 400: "#FBBF24" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF", 500: "#6B7280" },
  green: { 500: "#10B981" },
};

export default function CarReviews() {
  const { carId, carName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    if (carId) {
      fetchReviews();
    }
  }, [carId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getCarReviews(carId);
      setReviews(response.data?.reviews || response.reviews || []);
      setStats({
        averageRating: response.data?.averageRating || response.averageRating || 0,
        totalReviews: response.data?.totalReviews || response.totalReviews || 0,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color={COLORS.gold[500]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Reviews</Text>
          {carName && <Text style={styles.headerSubtitle}>{carName}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold[500]} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Stats Card */}
          <LinearGradient
            colors={[COLORS.gold[500], COLORS.gold[400]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <View style={styles.ratingBig}>
              <Ionicons name="star" size={32} color={COLORS.navy[900]} />
              <Text style={styles.ratingNumber}>
                {Number(stats.averageRating || 0).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.reviewCount}>
              {stats.totalReviews} {stats.totalReviews === 1 ? "Review" : "Reviews"}
            </Text>
          </LinearGradient>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.gray[500]} />
              <Text style={styles.emptyText}>No reviews yet</Text>
              <Text style={styles.emptySubtext}>
                Reviews will appear here once customers leave feedback
              </Text>
            </View>
          ) : (
            reviews.map((review, index) => (
              <View key={review._id || index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    {review.user?.profilePicture ? (
                      <Image
                        source={{ uri: review.user.profilePicture }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {review.user?.fullName?.[0] || "U"}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.reviewerName}>
                        {review.user?.fullName || "Customer"}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {renderStars(review.rating)}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  ratingBig: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingNumber: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.navy[900],
  },
  reviewCount: {
    fontSize: 14,
    color: COLORS.navy[800],
    fontWeight: "600",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray[400],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: "center",
    marginTop: 8,
    maxWidth: 250,
  },
  reviewCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold[500],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy[900],
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.gray[400],
    lineHeight: 20,
  },
});
