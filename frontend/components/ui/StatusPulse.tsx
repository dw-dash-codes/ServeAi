import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, USE_NATIVE_DRIVER } from '../../theme';

interface StatusPulseProps {
  status: 'active' | 'inactive' | 'error' | 'success';
  size?: number;
}

const statusColors = {
  active: '#4CAF50',
  inactive: '#707070',
  error: '#F44336',
  success: '#4CAF50',
};

export function StatusPulse({ status, size = 12 }: StatusPulseProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    if (status === 'active') {
      animation.start();
    }
    return () => animation.stop();
  }, [pulseAnim, status]);

  const color = statusColors[status];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: color,
            opacity: pulseAnim,
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  pulse: {
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
  },
});
