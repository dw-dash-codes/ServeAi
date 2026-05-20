import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { colors, USE_NATIVE_DRIVER, createShadow } from '../theme';

export default function Index() {
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [ready, setReady] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
    Animated.timing(taglineAnim, {
      toValue: 1, duration: 800, delay: 400, useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
    ).start();
    const timer = setTimeout(() => setReady(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (ready) {
    if (isLoggedIn) return <Redirect href="/(tabs)/home" />;
    if (isOnboarded) return <Redirect href="/login" />;
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.logoGlow, { transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: opacityAnim }]}>ServeAi</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: taglineAnim }]}>
        AI Service Orchestrator
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logoGlow: { position: 'absolute', width: 100, height: 100, borderRadius: 32, backgroundColor: colors.accent + '30' },
  logoBox: {
    width: 84, height: 84, borderRadius: 24, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    ...createShadow(colors.accent, 0, 0, 0.5, 24, 12),
  },
  logoIcon: { fontSize: 40 },
  title: { color: colors.textPrimary, fontSize: 40, fontWeight: '700', letterSpacing: 1 },
  tagline: { color: colors.textSecondary, fontSize: 14, marginTop: 12, letterSpacing: 2, textTransform: 'uppercase' },
});
