import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Main Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';

// Product Screens
import { ProductCreateScreen } from '../screens/ProductCreateScreen';
import { ProductSalesScreen } from '../screens/ProductSalesScreen';

// Sale Screens
import { SalesScreen } from '../screens/SalesScreen';

// Category Screens
import { CategoryCreateScreen } from '../screens/CategoryCreateScreen';

// User Screens
import { UsersScreen } from '../screens/UsersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProductsStack = createNativeStackNavigator();

const ProductsStackNavigator = () => {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen name="ProductsList" component={ProductsScreen} />
      <ProductsStack.Screen name="ProductSales" component={ProductSalesScreen} />
    </ProductsStack.Navigator>
  );
};

const MainTabs = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar, using custom component
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🍞</Text>,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📁</Text>,
        }}
      />
      {user?.role === 'admin' && (
        <Tab.Screen
          name="UsersTab"
          component={UsersScreen}
          options={{
            tabBarLabel: 'Users',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={loadingStyles.text}>Loading...</Text>
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      key={user ? 'authenticated' : 'unauthenticated'}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="ProductCreate"
            component={ProductCreateScreen}
            options={{ 
              headerShown: false,
              headerBackVisible: false 
            }}
          />
          <Stack.Screen
            name="ProductEdit"
            component={ProductCreateScreen}
            options={{ 
              headerShown: false,
              headerBackVisible: false 
            }}
          />
          <Stack.Screen
            name="SaleCreate"
            component={SalesScreen}
            options={{ headerShown: true, title: 'Record Sale' }}
          />
          <Stack.Screen
            name="CategoryCreate"
            component={CategoryCreateScreen}
            options={{ 
              headerShown: false,
              headerBackVisible: false 
            }}
          />
          <Stack.Screen
            name="CategoryEdit"
            component={CategoryCreateScreen}
            options={{ 
              headerShown: false,
              headerBackVisible: false 
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

