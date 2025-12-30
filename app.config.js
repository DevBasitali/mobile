// app.config.js
// Dynamic Expo config that reads from environment variables

export default ({ config }) => {
    const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    return {
        ...config,
        name: "Swift Ride",
        slug: "swift-ride",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "swiftride",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/splash-logo.png",
            resizeMode: "contain",
            backgroundColor: "#0A1628"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.swiftride.app",
            config: {
                googleMapsApiKey: googleMapsApiKey
            }
        },
        android: {
            package: "com.swiftride.app",
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            config: {
                googleMaps: {
                    apiKey: googleMapsApiKey
                }
            },
            intentFilters: [
                {
                    action: "VIEW",
                    autoVerify: true,
                    data: [
                        {
                            scheme: "swiftride",
                            host: "reset-password"
                        }
                    ],
                    category: ["BROWSABLE", "DEFAULT"]
                },
                {
                    action: "VIEW",
                    autoVerify: true,
                    data: [
                        {
                            scheme: "swiftride",
                            host: "payment"
                        }
                    ],
                    category: ["BROWSABLE", "DEFAULT"]
                }
            ]
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            "expo-secure-store",
            "@react-native-google-signin/google-signin",
            [
                "expo-location",
                {
                    "locationAlwaysAndWhenInUsePermission": "This app needs your location to track your car rental trip for the host's peace of mind.",
                    "locationAlwaysPermission": "Allow SwiftRide to access your location in the background for car tracking during your rental.",
                    "locationWhenInUsePermission": "Allow SwiftRide to access your location while using the app.",
                    "isAndroidBackgroundLocationEnabled": true,
                    "isIosBackgroundLocationEnabled": true
                }
            ],
            [
                "expo-camera",
                {
                    "cameraPermission": "Allow SwiftRide to access your camera to scan QR codes and take photos for car handover."
                }
            ]
        ],
        experiments: {
            typedRoutes: true
        }
    };
};
