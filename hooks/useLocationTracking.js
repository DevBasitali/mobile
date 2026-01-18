// hooks/useLocationTracking.js
// Professional location tracking hook for customers during ongoing trips
import { useState, useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import { useSocket } from "../context/SocketContext";

// Constants - read from env with fallback
const LOCATION_INTERVAL_MS = parseInt(
  process.env.EXPO_PUBLIC_LOCATION_INTERVAL_MS || "60000",
  10,
);
const DISTANCE_INTERVAL_M = parseInt(
  process.env.EXPO_PUBLIC_LOCATION_DISTANCE_M || "50",
  10,
);

/**
 * Hook for tracking and sending location updates
 * Used by CUSTOMER when their trip is ongoing
 *
 * @param {string} bookingId - The booking ID to track
 * @param {boolean} isActive - Whether tracking should be active
 * @returns {Object} - { location, isTracking, error, lastSentAt, stopTracking }
 */
export const useLocationTracking = (bookingId, isActive = false) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(null);
  const watchRef = useRef(null);
  const isMountedRef = useRef(true);

  // Get socket methods from context
  const { sendLocation, isConnected, connect } = useSocket();

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (!bookingId) {
      console.log("⚠️ No booking ID provided for tracking");
      return false;
    }

    try {
      console.log("🚗 Starting location tracking for booking:", bookingId);
      console.log("⏱️ Interval: every", LOCATION_INTERVAL_MS / 1000, "seconds");

      // Request foreground permission
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        const errorMsg = "Location permission denied";
        console.log("❌", errorMsg);
        setError(errorMsg);
        return false;
      }

      // Ensure socket is connected
      if (!isConnected) {
        console.log("🔌 Socket not connected, connecting...");
        connect();
      }

      // Stop any existing watch
      if (watchRef.current) {
        await watchRef.current.remove();
        watchRef.current = null;
      }

      // Start watching location with 10-second interval
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_INTERVAL_MS, // 10 seconds
          distanceInterval: DISTANCE_INTERVAL_M, // 10 meters
        },
        (newLocation) => {
          if (!isMountedRef.current) return;

          const coords = newLocation.coords;
          setLocation(coords);

          // Send location via socket
          const sent = sendLocation(bookingId, coords);

          if (sent) {
            setLastSentAt(new Date());
            console.log(
              "📍 Location sent:",
              coords.latitude.toFixed(6),
              coords.longitude.toFixed(6),
              "| Speed:",
              (coords.speed || 0).toFixed(1),
              "m/s",
            );
          } else {
            console.warn(
              "⚠️ Failed to send location - socket may be disconnected",
            );
          }
        },
      );

      setIsTracking(true);
      setError(null);
      console.log("✅ Location tracking started successfully");
      return true;
    } catch (err) {
      console.error("❌ Location tracking error:", err);
      setError(err.message);
      setIsTracking(false);
      return false;
    }
  }, [bookingId, isConnected, connect, sendLocation]);

  // Stop location tracking
  const stopTracking = useCallback(async () => {
    console.log("🛑 Stopping location tracking...");

    if (watchRef.current) {
      await watchRef.current.remove();
      watchRef.current = null;
    }

    setIsTracking(false);
    setLocation(null);
    setLastSentAt(null);
    console.log("✅ Location tracking stopped");
  }, []);

  // Effect to start/stop tracking based on isActive
  useEffect(() => {
    isMountedRef.current = true;

    if (isActive && bookingId) {
      startTracking();
    } else {
      stopTracking();
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, [isActive, bookingId, startTracking, stopTracking]);

  return {
    location,
    error,
    isTracking,
    lastSentAt,
    stopTracking,
    startTracking,
  };
};

export default useLocationTracking;
