import React, { useRef, useEffect, useState } from 'react';
import { CustomAlert as Alert } from '../components/ui/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, USE_NATIVE_DRIVER } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { BookingTimeline } from '../components/booking/BookingTimeline';
import { BookingStatusBadge } from '../components/booking/BookingStatusBadge';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookingStatus, cancelBooking } from '../services/api';

export default function BookingTrackingScreen() {
  const currentResponse = useBookingStore((s) => s.currentResponse);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const statusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: 'confirmed' | 'cancelled' | 'rejected' }) => 
      updateBookingStatus(bookingId, status),
    onSuccess: (res, variables) => {
      setLocalStatus(variables.status);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      const statusText = variables.status === 'confirmed' ? 'Accepted' : 'Rejected';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Success\n\nBooking request ${statusText} successfully!`);
        }
      } else {
        Alert.alert('Success', `Booking request ${statusText} successfully!`);
      }
    },
    onError: () => {
      const errorMsg = 'Failed to update booking status. Please try again.';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Error\n\n${errorMsg}`);
        }
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      setLocalStatus('cancelled');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      const successMsg = 'Booking cancelled successfully!';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Success\n\n${successMsg}`);
        }
      } else {
        Alert.alert('Success', successMsg);
      }
    },
    onError: () => {
      const errorMsg = 'Failed to cancel booking. Please try again.';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Error\n\n${errorMsg}`);
        }
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(progressAnim, { toValue: 1, friction: 6, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, []);

  if (!currentResponse?.execution_payload) {
    router.replace('/ai-request');
    return null;
  }

  const { execution_payload, recommended_provider, dynamic_pricing } = currentResponse;
  const status = localStatus || execution_payload.status;
  const providerName = execution_payload.provider_name || recommended_provider?.provider.name || 'Service Provider';
  const providerPhone = execution_payload.provider_phone || recommended_provider?.provider.phone || 'N/A';
  const customerName = execution_payload.user_name || 'Ahmed Hassan';
  const customerPhone = execution_payload.user_phone || '0300-1111101';

  const timelineEvents = [
    { status: 'confirmed' as const, label: 'Booking Confirmed', timestamp: execution_payload.created_at },
    { status: 'en_route' as const, label: 'Provider En Route' },
    { status: 'in_progress' as const, label: 'Service In Progress' },
    { status: 'completed' as const, label: 'Service Completed' },
  ];

  const statusProgress: Record<string, number> = {
    pending: 0, confirmed: 0.25, en_route: 0.5,
    in_progress: 0.75, completed: 1, cancelled: 0, disputed: 0.3,
  };
  const progress = statusProgress[status] || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Track Booking</Text>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.statusCard}>
            <ProgressRing progress={progress} size={100} label="Complete" />
            <View style={styles.statusInfo}>
              <BookingStatusBadge status={status as any} />
              <Text style={styles.statusText}>
                {providerName} is handling your request
              </Text>
              {status === 'en_route' && (
                <View style={styles.etaBanner}>
                  <Text style={styles.etaText}>
                    🚗 Arriving in ~{recommended_provider?.provider.estimated_travel_minutes || 15} min
                  </Text>
                </View>
              )}
            </View>
          </GlassCard>

          <GlassCard style={styles.bookingInfo}>
            <Text style={styles.infoTitle}>Booking Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{execution_payload.service_type.toUpperCase().replace('_', ' ')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{execution_payload.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{execution_payload.preferred_time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking ID</Text>
              <Text style={[styles.infoValue, { fontSize: 12 }]}>{execution_payload.booking_id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{customerName} (📞 {customerPhone})</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Provider</Text>
              <Text style={styles.infoValue}>{providerName} (📞 {providerPhone})</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={[styles.infoValue, { color: colors.accent, fontWeight: '700', fontSize: 18 }]}>
                PKR {execution_payload.pricing?.total_pkr || dynamic_pricing?.total_pkr}
              </Text>
            </View>
          </GlassCard>

          <Text style={styles.sectionTitle}>Timeline</Text>
          <GlassCard>
            <BookingTimeline events={timelineEvents} currentStatus={status as any} />
          </GlassCard>

          {/* Accept / Reject buttons for Provider */}
          {user?.role === 'provider' && status === 'pending' && (
            <View style={styles.dualButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => statusMutation.mutate({ bookingId: execution_payload.booking_id, status: 'confirmed' })}
                disabled={statusMutation.isPending}
              >
                <Text style={styles.btnText}>Accept Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => statusMutation.mutate({ bookingId: execution_payload.booking_id, status: 'rejected' })}
                disabled={statusMutation.isPending}
              >
                <Text style={styles.btnText}>Reject Booking</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel button for Customer */}
          {user?.role !== 'provider' && (status === 'pending' || status === 'confirmed') && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => cancelMutation.mutate(execution_payload.booking_id)}
              disabled={cancelMutation.isPending}
            >
              <Text style={styles.btnText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}

          {recommended_provider && (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/provider-detail', params: { id: recommended_provider.provider.provider_id } })}
            >
              <GlassCard style={styles.providerMiniCard}>
                <Text style={styles.providerMiniEmoji}>👨‍🔧</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerMiniName}>{recommended_provider.provider.name}</Text>
                  <Text style={styles.providerMiniRate}>⭐ {recommended_provider.provider.rating}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
              </GlassCard>
            </TouchableOpacity>
          )}

          {status !== 'completed' && status !== 'cancelled' && (
            <TouchableOpacity style={styles.cancelBookingBtn}
              onPress={() => {
                router.push('/dispute-resolution');
              }}
            >
              <Text style={styles.cancelBookingText}>Having an issue? Report <Ionicons name="arrow-forward" size={14} color={colors.error} /></Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
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
  statusCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingVertical: 20 },
  statusInfo: { flex: 1, marginLeft: 20 },
  statusText: { color: colors.textSecondary, fontSize: 13, marginTop: 8, lineHeight: 18 },
  etaBanner: {
    marginTop: 8, backgroundColor: 'rgba(76,175,80,0.12)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  etaText: { color: colors.success, fontSize: 12, fontWeight: '500' },
  bookingInfo: { marginBottom: 16 },
  infoTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: { color: colors.textSecondary, fontSize: 14 },
  infoValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  providerMiniCard: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16,
    borderWidth: 1, borderColor: colors.accent + '20',
  },
  providerMiniEmoji: { fontSize: 28, marginRight: 12 },
  providerMiniName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  providerMiniRate: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  providerMiniArrow: { color: colors.accent, fontSize: 18 },
  cancelBookingBtn: { alignItems: 'center', paddingVertical: 20 },
  cancelBookingText: { color: colors.warning, fontSize: 13 },
  dualButtons: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  acceptBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: colors.error,
  },
  cancelBtn: {
    backgroundColor: colors.warning,
    width: '100%',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
