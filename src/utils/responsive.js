import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

// Breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
};

// Hook to get screen dimensions and device type
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;
  const isSmallScreen = width < 600;
  const isMediumScreen = width >= 600 && width < 1024;
  const isLargeScreen = width >= 1024;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isWeb: Platform.OS === 'web',
  };
};

// Get responsive font size
export const getResponsiveFontSize = (baseSize, isMobile, isTablet) => {
  if (isMobile) return baseSize * 0.9;
  if (isTablet) return baseSize * 0.95;
  return baseSize;
};

// Get responsive padding
export const getResponsivePadding = (basePadding, isMobile, isTablet) => {
  if (isMobile) return basePadding * 0.7;
  if (isTablet) return basePadding * 0.85;
  return basePadding;
};

// Get grid columns based on screen size
export const getGridColumns = (isMobile, isTablet) => {
  if (isMobile) return 1;
  if (isTablet) return 2;
  return 3;
};

// Get table column widths based on screen size
export const getTableColumnWidths = (isMobile, isTablet) => {
  if (isMobile) {
    return {
      image: 60,
      name: 150,
      category: 100,
      price: 80,
      stock: 60,
      revenue: 100,
      stockValue: 100,
      expiry: 100,
      location: 100,
      actions: 120,
    };
  }
  if (isTablet) {
    return {
      image: 80,
      name: 180,
      category: 120,
      price: 100,
      stock: 80,
      revenue: 120,
      stockValue: 120,
      expiry: 120,
      location: 120,
      actions: 150,
    };
  }
  return {
    image: 80,
    name: 180,
    category: 120,
    price: 100,
    stock: 80,
    revenue: 120,
    stockValue: 120,
    expiry: 120,
    location: 120,
    actions: 150,
  };
};

