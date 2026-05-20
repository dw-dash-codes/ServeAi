import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { USE_NATIVE_DRIVER } from '../../theme';

interface ShimmerProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function Shimmer({ children, enabled = true }: ShimmerProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim, enabled]);

  const overlayOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  if (!enabled) return <>{children}</>;

  return (
    <View style={styles.container}>
      {children}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
});
