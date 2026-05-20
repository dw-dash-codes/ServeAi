import React, { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { colors, USE_NATIVE_DRIVER } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { BookingStatusBadge } from '../components/booking/BookingStatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '../services/api';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { Booking } from '../types';

export default function BookingHistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'history', user?.id, user?.role],
    queryFn: () => getBookings(
      user?.role === 'provider'
        ? { provider_id: user?.id }
        : { user_id: user?.id }
    ),
    enabled: !!user?.id,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates!
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }).start();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
          </TouchableOpacity>
          <Text style={styles.title}>Bookings</Text>
        </View>
        <View style={{ padding: 20 }}><CardSkeleton /><CardSkeleton /><CardSkeleton /></View>
      </View>
    );
  }

  const bookings = data?.bookings || [];

  const renderItem = ({ item, index }: { item: Booking; index: number }) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20 + index * 5, 0] }) }] }}>
      <TouchableOpacity onPress={() => {
        useBookingStore.getState().setCurrentResponse({
          execution_payload: item,
          dynamic_pricing: item.pricing,
          recommended_provider: null,
          extracted_intent: null,
          transaction_id: item.transaction_id,
          workflow_stage: 'completed',
          confidence_score: 1,
          clarification_required: false,
          clarification_prompt: '',
          provider_rankings: [],
          follow_up_action: {},
          agent_trace: [],
          ui_display_message: '',
        });
        router.push('/booking-tracking');
      }}>
        <GlassCard style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Text style={styles.serviceType}>{item.service_type}</Text>
            <BookingStatusBadge status={item.status} />
          </View>
          <Text style={styles.bookingLocation}>📍 {item.location}</Text>
          <View style={styles.bookingFooter}>
            <Text style={styles.bookingTime}>🕐 {item.preferred_time}</Text>
            <Text style={styles.bookingPrice}>PKR {item.pricing?.total_pkr || 0}</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Booking History</Text>
        <Text style={styles.count}>{bookings.length} total</Text>
      </View>

      {bookings.length === 0 ? (
        <EmptyState icon="📋" title="No bookings yet" message="Book a service to see it here" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.booking_id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', flex: 1 },
  count: { color: colors.textSecondary, fontSize: 13 },
  bookingCard: { marginBottom: 10 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceType: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  bookingLocation: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingTime: { color: colors.textMuted, fontSize: 12 },
  bookingPrice: { color: colors.accent, fontSize: 15, fontWeight: '700' },
});
