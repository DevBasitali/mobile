// services/backgroundLocationService.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import apiClient from './apiClient';
import { connectSocket, sendLocation, disconnectSocket } from './socketService';

const BACKGROUND_LOCATION_TASK = 'background-location-tracking';

// Store the current booking ID for background task
let currentBookingId = null;

// Define the background task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Background location error:', error);
        return;
    }

    if (data && currentBookingId) {
        const { locations } = data;
        const location = locations[0];

        if (location) {
            console.log('📍 [Background] Sending location:', location.coords.latitude, location.coords.longitude);

            // Send to server via HTTP (socket might not be connected in background)
            try {
                await apiClient.post(`/bookings/${currentBookingId}/location`, {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                    heading: location.coords.heading || 0,
                    speed: location.coords.speed || 0,
                    timestamp: new Date().toISOString(),
                });
            } catch (err) {
                console.log('Background location send error:', err.message);
            }
        }
    }
});

// Start background location tracking
export const startBackgroundTracking = async (bookingId) => {
    try {
        // Request background permission
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            console.log('Foreground location permission denied');
            return false;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            console.log('Background location permission denied');
            return false;
        }

        // Store booking ID for the task
        currentBookingId = bookingId;

        // Check if already tracking
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (hasStarted) {
            console.log('Background tracking already running');
            return true;
        }

        // Start background location updates
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000, // 10 seconds
            distanceInterval: 20, // 20 meters
            deferredUpdatesInterval: 10000,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: 'SwiftRide',
                notificationBody: 'Tracking your location for car rental safety',
                notificationColor: '#4F46E5',
            },
        });

        console.log('🚗 Background location tracking started for booking:', bookingId);
        return true;
    } catch (error) {
        console.error('Failed to start background tracking:', error);
        return false;
    }
};

// Stop background location tracking
export const stopBackgroundTracking = async () => {
    try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
            console.log('🛑 Background location tracking stopped');
        }
        currentBookingId = null;
    } catch (error) {
        console.error('Failed to stop background tracking:', error);
    }
};

// Check if background tracking is running
export const isBackgroundTrackingRunning = async () => {
    try {
        return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    } catch {
        return false;
    }
};

// Get current booking being tracked
export const getCurrentTrackingBookingId = () => currentBookingId;

export default {
    startBackgroundTracking,
    stopBackgroundTracking,
    isBackgroundTrackingRunning,
    getCurrentTrackingBookingId,
    BACKGROUND_LOCATION_TASK,
};
