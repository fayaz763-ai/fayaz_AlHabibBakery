import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';
import { useResponsive } from '../utils/responsive';

export const Header = ({ title, rightComponent, showLogo = true }) => {
  const { isMobile, isTablet, width } = useResponsive();
  
  // Responsive header sizing - logo fills full height
  const headerPaddingVertical = isMobile ? 4 : isTablet ? 6 : 8;
  const headerPaddingHorizontal = isMobile ? 12 : isTablet ? 16 : 20;
  const headerHeight = isMobile ? 70 : isTablet ? 85 : 100;
  
  // Logo fills entire header height
  const logoHeight = headerHeight;

  const dynamicLogoStyle = {
    height: logoHeight,
    width: logoHeight * 1.5, // Maintain aspect ratio (adjust multiplier as needed)
    maxWidth: width * 0.3, // Max 30% of screen width
    minWidth: 120, // Minimum width to ensure visibility
  };

  const dynamicLogoContainerStyle = {
    height: headerHeight,
    alignSelf: 'stretch',
  };

  const dynamicHeaderContentStyle = {
    paddingHorizontal: headerPaddingHorizontal,
    paddingVertical: headerPaddingVertical,
    height: headerHeight,
  };

  return (
    <View style={styles.header}>
      <View style={[styles.headerContent, dynamicHeaderContentStyle]}>
        {showLogo && (
          <View style={[styles.logoContainer, dynamicLogoContainerStyle]}>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoMainText}>AL HABIB</Text>
              <View style={styles.bakeryContainer}>
                <View style={styles.decorativeLine} />
                <Text style={styles.logoSubText}>BAKERY</Text>
                <View style={styles.decorativeLine} />
              </View>
            </View>
          </View>
        )}
        <View style={styles.titleContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
        {rightComponent && (
          <View style={styles.rightContainer}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFBF0',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC6',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'stretch', // Stretch all children to full height
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFBF0',
  },
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: 10,
    minWidth: 150, // Ensure container has minimum width
  },
  logoTextContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logoMainText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#A0522D',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
    ...(Platform.OS === 'web' && {
      fontFamily: 'Georgia, serif', // Serif font for "AL HABIB"
      fontWeight: '400',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2), 0px 1px 2px rgba(0, 0, 0, 0.15)',
      display: 'inline-block',
    }),
    ...(Platform.OS !== 'web' && {
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    }),
  },
  bakeryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  decorativeLine: {
    width: 20,
    height: 1,
    backgroundColor: '#A0522D',
    marginHorizontal: 6,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    }),
  },
  logoSubText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A0522D',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    ...(Platform.OS === 'web' && {
      fontFamily: 'Arial, sans-serif', // Sans-serif font for "BAKERY"
      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.15), 0px 1px 1px rgba(0, 0, 0, 0.1)',
      transform: 'skew(-3deg)',
      display: 'inline-block',
    }),
    ...(Platform.OS !== 'web' && {
      textShadowColor: 'rgba(0, 0, 0, 0.15)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      transform: [{ skewX: '-3deg' }],
    }),
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

