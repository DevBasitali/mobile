// app/(customer)/_layout.jsx
import { Stack } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { AppState } from "react-native";
import { getMyBookings } from "../../services/bookingService";
import { useLocationTracking } from "../../hooks/useLocationTracking";
import {
  startBackgroundTracking,
  stopBackgroundTracking,
  isBackgroundTrackingRunning,
  setTrackingBookingId,
} from "../../services/backgroundLocationService";

// Background component that auto-tracks location for ongoing bookings
// Works BOTH when app is open (via socket) AND when app is closed (via HTTP)
function BackgroundLocationTracker() {
  const [ongoingBookingId, setOngoingBookingId] = useState(null);
  const appState = useRef(AppState.currentState);

  // Fetch bookings to check for ongoing trip
  useEffect(() => {
    const checkOngoingBooking = async () => {
      try {
        console.log("🔍 Checking for ongoing bookings...");
        const response = await getMyBookings();

        // Extract bookings from response
        let bookings = [];
        if (response?.data?.items) {
          bookings = response.data.items;
        } else if (Array.isArray(response?.data)) {
          bookings = response.data;
        } else if (Array.isArray(response)) {
          bookings = response;
        }

        const ongoing = bookings.find((b) => b.status === "ongoing");

        if (ongoing) {
          const bookingIdToUse = ongoing.id || ongoing._id;
          console.log("🚗 Found ongoing booking:", bookingIdToUse);
          setOngoingBookingId(bookingIdToUse);
        } else {
          console.log("ℹ️ No ongoing booking found");
          // Stop background tracking if no ongoing booking
          if (await isBackgroundTrackingRunning()) {
            await stopBackgroundTracking();
          }
          setOngoingBookingId(null);
        }
      } catch (error) {
        console.log("❌ Error checking bookings:", error.message);
      }
    };

    // Check immediately on mount
    checkOngoingBooking();

    // Check every 30 seconds for status changes
    const interval = setInterval(checkOngoingBooking, 30000);

    return () => clearInterval(interval);
  }, []);

  // Start BACKGROUND tracking when there's an ongoing booking
  // This continues to work even when app is closed!
  useEffect(() => {
    const manageBackgroundTracking = async () => {
      if (ongoingBookingId) {
        console.log("🔒 Starting BACKGROUND tracking for maximum safety...");
        setTrackingBookingId(ongoingBookingId); // Set the booking ID for background task
        const started = await startBackgroundTracking(ongoingBookingId);
        if (started) {
          console.log(
            "✅ Background tracking ACTIVE - works even when app is closed!",
          );
        } else {
          console.log(
            "⚠️ Background tracking could not start - foreground only",
          );
        }
      } else {
        // Stop background tracking when no ongoing booking
        await stopBackgroundTracking();
      }
    };

    manageBackgroundTracking();

    return () => {
      // Don't stop on unmount - we want it to keep running!
      // Only stop when booking ends
    };
  }, [ongoingBookingId]);

  // Handle app state changes - ensure tracking continues on return
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          ongoingBookingId
        ) {
          console.log("📱 App returned to foreground, verifying tracking...");
          const isRunning = await isBackgroundTrackingRunning();
          if (!isRunning) {
            console.log("🔄 Restarting background tracking...");
            await startBackgroundTracking(ongoingBookingId);
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription?.remove();
  }, [ongoingBookingId]);

  // ALSO use foreground tracking (via socket) for real-time updates when app is open
  const { isTracking, error } = useLocationTracking(
    ongoingBookingId,
    !!ongoingBookingId,
  );

  useEffect(() => {
    if (ongoingBookingId) {
      console.log(
        `📍 Foreground tracking status: ${isTracking ? "ACTIVE" : "STARTING"}`,
      );
      if (error) {
        console.log("⚠️ Foreground tracking error:", error);
      }
    }
  }, [isTracking, error, ongoingBookingId]);

  return null; // This component doesn't render anything
}

export default function CustomerLayout() {
  return (
    <>
      {/* Background tracker - always runs when customer is logged in */}
      {/* Combines: Socket (foreground) + HTTP (background) for maximum safety */}
      <BackgroundLocationTracker />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="car/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="bookings/create"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </>
  );
}
