import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { createShadow } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
}

export function GlassCard({ children, style, glowColor }: GlassCardProps) {
  return (
    <View style={[styles.card, glowColor ? { borderColor: glowColor } : {}, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    ...createShadow('#000', 0, 4, 0.15, 12, 4),
  },
});

