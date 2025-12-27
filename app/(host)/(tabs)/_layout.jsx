import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

// 🎨 Premium Theme Colors
const COLORS = {
  background: '#0A1628', // Deep Navy
  active: '#F59E0B',     // Gold
  inactive: '#64748B',   // Slate Gray
  border: '#1E3A5F'      // Lighter Navy
};

export default function HostTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      {/* 🏠 Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={focused ? "view-dashboard" : "view-dashboard-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 🚗 Fleet */}
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'My Fleet',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={focused ? "car-multiple" : "car-multiple"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 💰 Wallet */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={focused ? "wallet" : "wallet-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 👤 Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={focused ? "account-circle" : "account-circle-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}