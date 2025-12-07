import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

// Power icon component - white power symbol on red circle
const PowerIcon = () => {
  return (
    <View style={styles.powerIconContainer}>
      {/* Red circle background */}
      <View style={styles.powerIconCircle}>
        {/* Power symbol - incomplete circle with vertical line */}
        <View style={styles.powerSymbol}>
          {/* Top arc of circle (using border trick) */}
          <View style={styles.powerArc} />
          {/* Vertical line */}
          <View style={styles.powerLine} />
        </View>
      </View>
    </View>
  );
};

export const BottomTabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useAuth();

  const tabs = [
    {
      name: 'DashboardTab',
      label: 'Dashboard',
      icon: '📊',
      screen: 'Main',
      params: { screen: 'DashboardTab' },
    },
    {
      name: 'ProductsTab',
      label: 'Products',
      icon: '🍞',
      screen: 'Main',
      params: { screen: 'ProductsTab' },
    },
    {
      name: 'CategoriesTab',
      label: 'Categories',
      icon: '📁',
      screen: 'Main',
      params: { screen: 'CategoriesTab' },
    },
    ...(user?.role === 'admin' ? [{
      name: 'UsersTab',
      label: 'Users',
      icon: '👥',
      screen: 'Main',
      params: { screen: 'UsersTab' },
    }] : []),
    {
      name: 'Logout',
      label: 'Logout',
      icon: '⏻',
      isLogout: true,
    },
  ];

  const getActiveTab = () => {
    const routeName = route.name;
    // Check if current route matches any tab
    if (routeName === 'Main') {
      const state = navigation.getState();
      const mainState = state.routes.find(r => r.name === 'Main')?.state;
      if (mainState) {
        const activeTab = mainState.routes[mainState.index]?.name;
        return activeTab;
      }
    }
    // For nested routes, check parent
    if (routeName === 'ProductsList' || routeName === 'ProductSales') {
      return 'ProductsTab';
    }
    return null;
  };

  const activeTab = getActiveTab();

  const handleTabPress = (tab) => {
    if (tab.isLogout) {
      // Handle logout
      if (Platform.OS === 'web') {
        if (window.confirm('Are you sure you want to logout?')) {
          logout();
        }
      } else {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
        ]);
      }
    } else if (tab.screen === 'Main') {
      navigation.navigate(tab.screen, tab.params);
    } else {
      navigation.navigate(tab.screen);
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = !tab.isLogout && (activeTab === tab.name || 
          (tab.name === 'ProductsTab' && (route.name === 'ProductsList' || route.name === 'ProductSales')));
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.activeTab, tab.isLogout && styles.logoutTab]}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            {tab.isLogout ? (
              <View style={styles.logoutIconContainer}>
                <PowerIcon />
              </View>
            ) : (
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {tab.icon}
              </Text>
            )}
            <Text style={[styles.label, isActive && styles.activeLabel, tab.isLogout && styles.logoutLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    height: Platform.OS === 'ios' ? 80 : 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  activeTab: {
    // Active state styling
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
    color: colors.textSecondary,
  },
  activeIcon: {
    color: colors.primary,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  logoutTab: {
    // Logout tab styling
  },
  logoutIconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    overflow: 'visible',
  },
  powerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  powerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }),
  },
  powerSymbol: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  powerArc: {
    width: 16,
    height: 8,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'absolute',
    top: 0,
    left: 1,
  },
  powerLine: {
    width: 2.5,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.25,
    position: 'absolute',
    top: 5,
    left: 7.75,
  },
  logoutLabel: {
    color: colors.error,
    fontWeight: '600',
  },
});

