import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';

export const Card = ({ children, style, onPress }) => {
  const cardStyle = [
    styles.card,
    onPress && styles.clickableCard,
    style
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      cursor: 'default',
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  clickableCard: {
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
});

