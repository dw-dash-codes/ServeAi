import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export function useFadeIn(duration = 500) {
  const opacity = useRef(new Animated.Value(0)).current;

  const animate = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);

  return { opacity, animate };
}

export function useSlideIn(duration = 400, direction: 'up' | 'down' | 'left' | 'right' = 'up') {
  const translateMap = {
    up: { x: 0, y: 30 },
    down: { x: 0, y: -30 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
  };

  const translate = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const initial = translateMap[direction];

  const opacity = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY(initial)).current;

  const animate = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(position, {
        toValue: { x: 0, y: 0 },
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, position, duration]);

  return {
    opacity,
    translate,
    position,
    animate,
  };
}

export function useScaleIn(duration = 400) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animate = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, duration]);

  return { scale, opacity, animate };
}
