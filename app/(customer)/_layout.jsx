// app/(customer)/_layout.jsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getMyBookings } from '../../services/bookingService';
import { useLocationTracking } from '../../hooks/useLocationTracking';

// Background component that auto-tracks location for ongoing bookings
function BackgroundLocationTracker() {
  const [ongoingBookingId, setOngoingBookingId] = useState(null);

  // Fetch bookings to check for ongoing trip
  useEffect(() => {
    const checkOngoingBooking = async () => {
      try {
        const response = await getMyBookings();
        const bookings = response.data?.docs || response.data?.data?.items || [];
        const ongoing = bookings.find(b => b.status === 'ongoing');
        if (ongoing) {
          console.log('🚗 Found ongoing booking, starting auto-tracking:', ongoing.id);
          setOngoingBookingId(ongoing.id);
        } else {
          setOngoingBookingId(null);
        }
      } catch (error) {
        console.log('Error checking for ongoing bookings:', error.message);
      }
    };

    // Check immediately
    checkOngoingBooking();

    // Check every 30 seconds for new ongoing bookings
    const interval = setInterval(checkOngoingBooking, 30000);

    return () => clearInterval(interval);
  }, []);

  // Use the location tracking hook - automatically tracks when ongoingBookingId exists
  useLocationTracking(ongoingBookingId, !!ongoingBookingId);

  return null; // This component doesn't render anything
}

export default function CustomerLayout() {
  return (
    <>
      {/* Background tracker - always runs when customer is logged in */}
      <BackgroundLocationTracker />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="car/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="bookings/create"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
}