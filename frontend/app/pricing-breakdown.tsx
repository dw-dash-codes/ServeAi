import React, { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { colors, USE_NATIVE_DRIVER } from '../theme';
import { PricingBreakdownCard } from '../components/booking/PricingBreakdownCard';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useBookingStore } from '../store/useBookingStore';

export default function PricingBreakdownScreen() {
  const currentResponse = useBookingStore((s) => s.currentResponse);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, []);

  if (!currentResponse?.dynamic_pricing) {
    router.replace('/ai-request');
    return null;
  }

  const { dynamic_pricing, recommended_provider, extracted_intent } = currentResponse;

  const handleConfirm = () => {
    router.push('/booking-confirmation');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Price Details</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {extracted_intent && (
          <GlassCard style={styles.intentCard}>
            <Text style={styles.intentEmoji}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.intentTitle}>{extracted_intent.service_type} Service</Text>
              <Text style={styles.intentSub}>{extracted_intent.location}</Text>
              <View style={styles.intentTags}>
                <View style={styles.intentTag}>
                  <Text style={styles.intentTagText}>⚡ {extracted_intent.urgency}</Text>
                </View>
                <View style={styles.intentTag}>
                  <Text style={styles.intentTagText}>🎯 {extracted_intent.complexity}</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        )}

        {recommended_provider && (
          <GlassCard style={styles.providerCard}>
            <View style={styles.providerRow}>
              <Text style={styles.providerEmoji}>👨‍🔧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{recommended_provider.provider.name}</Text>
                <Text style={styles.providerCategory}>
                  {recommended_provider.provider.service_categories.join(', ')}
                </Text>
              </View>
              <Text style={styles.providerRating}>
                ⭐ {recommended_provider.provider.rating}
              </Text>
            </View>
          </GlassCard>
        )}

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <PricingBreakdownCard pricing={dynamic_pricing} />
        </Animated.View>

        <GlassCard style={styles.trustCard}>
          <Text style={styles.trustEmoji}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Secure & Transparent Pricing</Text>
            <Text style={styles.trustSub}>
              No hidden fees. Pay after service completion.
            </Text>
          </View>
        </GlassCard>

        <AnimatedButton
          title="✅ Confirm Booking"
          onPress={handleConfirm}
          style={{ marginTop: 8 }}
        />

        <TouchableOpacity style={styles.compareLink} onPress={() => router.push('/provider-results')}>
          <Text style={styles.compareText}>Compare other providers <Ionicons name="arrow-forward" size={14} color={colors.accent} /></Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  content: { flex: 1, padding: 20 },
  intentCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  intentEmoji: { fontSize: 28, marginRight: 12 },
  intentTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  intentSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  intentTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  intentTag: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  intentTagText: { color: colors.textSecondary, fontSize: 10 },
  providerCard: { marginBottom: 16 },
  providerRow: { flexDirection: 'row', alignItems: 'center' },
  providerEmoji: { fontSize: 28, marginRight: 12 },
  providerName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  providerCategory: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  providerRating: { color: colors.textPrimary, fontSize: 14 },
  trustCard: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 16,
    backgroundColor: 'rgba(76,175,80,0.06)', borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)',
  },
  trustEmoji: { fontSize: 28, marginRight: 12 },
  trustTitle: { color: colors.success, fontSize: 14, fontWeight: '600' },
  trustSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  compareLink: { alignItems: 'center', paddingVertical: 16 },
  compareText: { color: colors.accent, fontSize: 13 },
});
