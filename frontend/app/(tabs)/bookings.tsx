import React, { useState } from 'react';
import { CustomAlert as Alert } from '../../components/ui/CustomAlert';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { BookingStatusBadge } from '../../components/booking/BookingStatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, cancelBooking, updateBookingStatus, addReview } from '../../services/api';
import { CardSkeleton } from '../../components/ui/SkeletonLoader';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function BookingsScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const reviewMutation = useMutation({
    mutationFn: (params: { provider_id: string; user_id: string; rating: number; comment: string; booking_id: string }) => 
      addReview(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      const successMsg = 'Thank you for your rating!';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Success\n\n${successMsg}`);
        }
      } else {
        Alert.alert('Success', successMsg);
      }
      setShowRatingModal(false);
      setSelectedBooking(null);
      setRating(5);
      setReviewComment('');
    },
    onError: () => {
      const errorMsg = 'Failed to submit review. Please try again.';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Error\n\n${errorMsg}`);
        }
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  });

  const renderStars = () => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={star <= rating ? '#FFD700' : colors.textMuted}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const statusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: 'confirmed' | 'cancelled' | 'rejected' | 'completed' }) => 
      updateBookingStatus(bookingId, status),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      let statusText = 'Rejected';
      if (variables.status === 'confirmed') statusText = 'Accepted';
      else if (variables.status === 'completed') statusText = 'Completed';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Success\n\nBooking request ${statusText} successfully!`);
        }
      } else {
        Alert.alert('Success', `Booking request ${statusText} successfully!`);
      }
      setSelectedBooking(null);
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
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      const successMsg = 'Booking cancelled successfully!';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Success\n\n${successMsg}`);
        }
      } else {
        Alert.alert('Success', successMsg);
      }
      setSelectedBooking(null);
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
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', user?.id, user?.role],
    queryFn: () => getBookings(
      user?.role === 'provider'
        ? { provider_id: user?.id }
        : { user_id: user?.id }
    ),
    enabled: !!user?.id,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates!
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Bookings</Text>
        <View style={{ padding: 20 }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      </View>
    );
  }

  const bookings = data?.bookings || [];

  if (bookings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Bookings</Text>
        <EmptyState
          title={user?.role === 'provider' ? "No booking requests yet" : "No bookings yet"}
          description={user?.role === 'provider' ? "Your service booking requests will appear here once customers book you." : "Make your first AI-powered service request"}
          actionLabel={user?.role === 'provider' ? undefined : "Book Now"}
          onAction={user?.role === 'provider' ? undefined : () => router.push('/ai-request')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.booking_id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedBooking(item)}>
            <GlassCard style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.serviceType}>
                  {item.service_type === 'ac_technician' ? '❄️ AC Technician' : 
                   item.service_type === 'plumber' ? '🚰 Plumber' :
                   item.service_type === 'electrician' ? '⚡ Electrician' :
                   item.service_type === 'mechanic' ? '🔧 Mechanic' :
                   item.service_type === 'cleaner' ? '🧹 Cleaner' :
                   item.service_type === 'carpenter' ? '🪚 Carpenter' :
                   item.service_type === 'tutor' ? '📚 Tutor' :
                   item.service_type === 'towing' ? '🚜 Towing' : '🔧 ' + item.service_type}
                </Text>
                <BookingStatusBadge status={item.status} />
              </View>
              <Text style={styles.location}>📍 {item.location}</Text>
              <Text style={styles.time}>🕐 {item.preferred_time}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>PKR {item.pricing.total_pkr}</Text>
                {user?.role !== 'provider' && item.status === 'completed' && (
                  <View style={[styles.ratedBadge, { backgroundColor: item.is_rated ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)' }]}>
                    <Text style={[styles.ratedText, { color: item.is_rated ? '#4CAF50' : '#FF9800' }]}>
                      {item.is_rated ? '⭐ Rated' : '⭐ Rate Service'}
                    </Text>
                  </View>
                )}
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedBooking} transparent={true} animationType="slide" onRequestClose={() => setSelectedBooking(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Booking Details</Text>
                <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedBooking && (
                <View style={styles.modalBody}>
                  <View style={styles.statusRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <BookingStatusBadge status={selectedBooking.status} />
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionHeader}>Service Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Service</Text>
                      <Text style={styles.detailValue}>{selectedBooking.service_type.toUpperCase().replace('_', ' ')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Booking Time</Text>
                      <Text style={styles.detailValue}>{selectedBooking.preferred_time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue}>{selectedBooking.location}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionHeader}>Parties Involved</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Customer Name</Text>
                      <Text style={styles.detailValue}>{selectedBooking.user_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Customer Contact</Text>
                      <Text style={[styles.detailValue, { color: colors.accent }]}>📞 {selectedBooking.user_phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Provider Name</Text>
                      <Text style={styles.detailValue}>{selectedBooking.provider_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Provider Contact</Text>
                      <Text style={[styles.detailValue, { color: colors.accent }]}>📞 {selectedBooking.provider_phone}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionHeader}>Pricing Breakdown</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Base Rate</Text>
                      <Text style={styles.detailValue}>PKR {selectedBooking.pricing.base_rate}</Text>
                    </View>
                    {selectedBooking.pricing.travel_fee > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Travel Fee</Text>
                        <Text style={styles.detailValue}>PKR {selectedBooking.pricing.travel_fee}</Text>
                      </View>
                    )}
                    {selectedBooking.pricing.urgency_multiplier > 1 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Urgency Adjuster</Text>
                        <Text style={styles.detailValue}>x{selectedBooking.pricing.urgency_multiplier}</Text>
                      </View>
                    )}
                    <View style={[styles.detailRow, { borderBottomWidth: 0, marginTop: 4 }]}>
                      <Text style={[styles.detailLabel, { fontWeight: '700', color: colors.textPrimary }]}>Total Price</Text>
                      <Text style={[styles.detailValue, { color: colors.accent, fontWeight: '700', fontSize: 18 }]}>
                        PKR {selectedBooking.pricing.total_pkr}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionContainer}>
                    {/* Action buttons for Provider */}
                    {user?.role === 'provider' && selectedBooking.status === 'pending' && (
                      <View style={styles.dualButtons}>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.acceptBtn]}
                          onPress={() => statusMutation.mutate({ bookingId: selectedBooking.booking_id, status: 'confirmed' })}
                          disabled={statusMutation.isPending}
                        >
                          <Text style={styles.btnText}>Accept Booking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => statusMutation.mutate({ bookingId: selectedBooking.booking_id, status: 'rejected' })}
                          disabled={statusMutation.isPending}
                        >
                          <Text style={styles.btnText}>Reject Booking</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {user?.role === 'provider' && selectedBooking.status === 'confirmed' && (
                      <View style={styles.dualButtons}>
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: colors.success }]}
                          onPress={() => statusMutation.mutate({ bookingId: selectedBooking.booking_id, status: 'completed' })}
                          disabled={statusMutation.isPending}
                        >
                          <Text style={styles.btnText}>✓ Mark Completed</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.cancelBtn]}
                          onPress={() => cancelMutation.mutate(selectedBooking.booking_id)}
                          disabled={cancelMutation.isPending}
                        >
                          <Text style={styles.btnText}>Cancel Job</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Action buttons for Customer */}
                    {user?.role !== 'provider' && (selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.cancelBtn]}
                        onPress={() => cancelMutation.mutate(selectedBooking.booking_id)}
                        disabled={cancelMutation.isPending}
                      >
                        <Text style={styles.btnText}>Cancel Booking</Text>
                      </TouchableOpacity>
                    )}

                    {user?.role !== 'provider' && selectedBooking.status === 'completed' && !selectedBooking.is_rated && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                        onPress={() => {
                          setShowRatingModal(true);
                        }}
                      >
                        <Text style={styles.btnText}>⭐ Rate Service / Provider</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedBooking(null)}>
                      <Text style={styles.closeBtnText}>Close Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showRatingModal} transparent={true} animationType="fade" onRequestClose={() => setShowRatingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.ratingBody}>
                <Text style={styles.ratingSubtitle}>
                  How was the service provided by {selectedBooking?.provider_name}?
                </Text>
                
                {renderStars()}

                <Text style={styles.ratingText}>
                  {rating === 1 ? 'Terrible 😞' :
                   rating === 2 ? 'Poor 😕' :
                   rating === 3 ? 'Average 😐' :
                   rating === 4 ? 'Good 😊' : 'Excellent! 🤩'}
                </Text>

                <Text style={styles.label}>Write a Comment (optional)</Text>
                <TextInput
                  style={styles.commentInput}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder="Share details of your experience..."
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={[styles.submitReviewBtn, reviewMutation.isPending && { opacity: 0.6 }]}
                  onPress={() => {
                    if (selectedBooking && user) {
                      reviewMutation.mutate({
                        provider_id: selectedBooking.provider_id,
                        user_id: user.id,
                        rating,
                        comment: reviewComment,
                        booking_id: selectedBooking.booking_id,
                      });
                    }
                  }}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Submit Review</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelRatingBtn}
                  onPress={() => setShowRatingModal(false)}
                >
                  <Text style={styles.cancelRatingText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
  },
  bookingCard: { marginBottom: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceType: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  location: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
  time: { color: colors.textSecondary, fontSize: 14, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  price: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  date: { color: colors.textMuted, fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    padding: 16,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '85%',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  closeIcon: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '500',
  },
  modalBody: {
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    borderRadius: 12,
  },
  detailSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 20,
    gap: 12,
  },
  dualButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: colors.error,
  },
  cancelBtn: {
    backgroundColor: colors.warning,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  closeBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  ratedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
    width: '100%',
  },
  ratingBody: {
    alignItems: 'center',
    width: '100%',
  },
  ratingSubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 8,
  },
  commentInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    color: colors.textPrimary,
    fontSize: 15,
    width: '100%',
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 6,
    marginBottom: 12,
  },
  submitReviewBtn: {
    backgroundColor: colors.success,
    borderRadius: 14,
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelRatingBtn: {
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  cancelRatingText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 12,
    textTransform: 'uppercase',
  },
});
