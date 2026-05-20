import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, TextInput, Modal, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, USE_NATIVE_DRIVER } from '../../theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { getBookings, updateBookingStatus, addReview } from '../../services/api';
import { Booking } from '../../types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert as Alert } from '../../components/ui/CustomAlert';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PADDING = 20;
const GRID_GAP = 10;
const INNER_W = SCREEN_W - H_PADDING * 2;
const CAT_W = (INNER_W - GRID_GAP * 3) / 4;
const ACTION_W = (INNER_W - GRID_GAP) / 2;

const categories = [
  { icon: 'build-outline', title: 'Mechanic', color: '#FF7043', service: 'mechanic' },
  { icon: 'flash-outline', title: 'Electrician', color: '#FFB300', service: 'electrician' },
  { icon: 'water-outline', title: 'Plumber', color: '#42A5F5', service: 'plumber' },
  { icon: 'snow-outline', title: 'AC Tech', color: '#26C6DA', service: 'ac_technician' },
  { icon: 'sparkles-outline', title: 'Cleaner', color: '#66BB6A', service: 'cleaner' },
  { icon: 'hammer-outline', title: 'Carpenter', color: '#8D6E63', service: 'carpenter' },
  { icon: 'book-outline', title: 'Tutor', color: '#AB47BC', service: 'tutor' },
  { icon: 'car-sport-outline', title: 'Towing', color: '#EF5350', service: 'towing' },
];

const promos = [
  { icon: 'gift-outline', title: 'First Booking Discount', desc: 'Get 20% off your first service!', color: colors.accent },
  { icon: 'time-outline', title: 'Same-Day Service', desc: 'Book before 12 PM for same-day', color: colors.slateBlue },
  { icon: 'people-outline', title: 'Refer a Friend', desc: 'Earn PKR 500 per referral', color: '#FF9800' },
];

const quickActions = [
  { title: 'AI Request', icon: 'sparkles', route: '/ai-request', color: colors.accent },
  { title: 'My Bookings', icon: 'list', route: '/booking-history', color: colors.slateBlue },
];

function ProviderDashboard({ user, headerAnim }: { user: any, headerAnim: Animated.Value }) {
  const queryClient = useQueryClient();
  const { data: bookingsData } = useQuery({ 
    queryKey: ['bookings', 'provider', user.id], 
    queryFn: () => getBookings({ provider_id: user.id }),
    refetchInterval: 3000 // Poll every 3 seconds for real-time provider updates!
  });
  
  const incomingBookings = (bookingsData?.bookings || []).filter((b: Booking) => b.status === 'pending');
  const activeBookings = (bookingsData?.bookings || []).filter((b: Booking) => b.status === 'confirmed');

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'confirmed'|'rejected' }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'provider', user.id] });
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Provider Dashboard</Text>
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="person-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Text style={styles.sectionTitle}>Pending Requests ({incomingBookings.length})</Text>
      {incomingBookings.length === 0 && (
        <Text style={{ color: colors.textMuted, paddingHorizontal: 16, marginTop: 8 }}>No pending requests right now.</Text>
      )}
      {incomingBookings.map((b: Booking) => (
        <GlassCard key={b.booking_id} style={[styles.bookingCard, { borderColor: colors.warning + '50' }]}>
          <View style={styles.bookingRow}>
            <View>
              <Text style={styles.bookingService}>{b.service_type}</Text>
              <Text style={styles.bookingLocation}>{b.location} • {b.preferred_time}</Text>
              <Text style={styles.bookingDate}>Est. PKR {b.pricing.total_pkr}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
            <TouchableOpacity 
              style={[styles.providerBtn, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
              onPress={() => updateStatusMut.mutate({ id: b.booking_id, status: 'confirmed' })}
            >
              <Text style={{ color: colors.success, fontWeight: '600' }}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.providerBtn, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
              onPress={() => updateStatusMut.mutate({ id: b.booking_id, status: 'rejected' })}
            >
              <Text style={{ color: colors.error, fontWeight: '600' }}>Reject</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Active Jobs</Text>
      {activeBookings.length === 0 && (
        <Text style={{ color: colors.textMuted, paddingHorizontal: 16, marginTop: 8 }}>No active jobs.</Text>
      )}
      {activeBookings.map((b: Booking) => (
        <GlassCard key={b.booking_id} style={styles.bookingCard}>
          <View style={styles.bookingRow}>
            <View>
              <Text style={styles.bookingService}>{b.service_type}</Text>
              <Text style={styles.bookingLocation}>{b.location} • {b.preferred_time}</Text>
              <Text style={styles.bookingDate}>PKR {b.pricing.total_pkr}</Text>
            </View>
            <View style={styles.bookingRight}>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(76,175,80,0.15)' }]}>
                <Text style={[styles.statusText, { color: colors.success }]}>Confirmed</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      ))}
    </ScrollView>
  );
}


export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const userName = user?.name?.split(' ')[0] || 'Ahmed';
  const headerAnim = useRef(new Animated.Value(0)).current;
  const queryClient = useQueryClient();

  const { data: bookingsData } = useQuery({ 
    queryKey: ['bookings', 'customer', user?.id], 
    queryFn: () => getBookings({ user_id: user?.id }),
    enabled: !!user?.id,
    refetchInterval: 3000 // Poll every 3 seconds for real-time updates!
  });
  const recentBookings = bookingsData?.bookings?.slice(0, 3) || [];
  
  const [prompt, setPrompt] = useState('');
  
  // Rating logic states
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

  const unratedBooking = bookingsData?.bookings?.find((b: Booking) => b.status === 'completed' && !b.is_rated);

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

  const totalAnims = categories.length + quickActions.length + 3; // Use fixed 3 to ensure we don't break stagger count logic
  const staggerAnims = useRef(Array.from({ length: totalAnims }).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }).start();
    staggerAnims.forEach((anim, i) => {
      Animated.spring(anim, { toValue: 1, delay: 100 + i * 60, friction: 7, useNativeDriver: USE_NATIVE_DRIVER }).start();
    });
  }, []);

  const getAnimStyle = (i: number) => {
    const anim = staggerAnims[i];
    if (!anim) return {};
    return {
      opacity: anim,
      transform: [{ scale: anim }],
    };
  };
  
  const handleAISearch = () => {
    if (prompt.trim()) {
      router.push({ pathname: '/ai-request', params: { initialPrompt: prompt } } as any);
      setPrompt('');
    } else {
      router.push('/ai-request');
    }
  };

  if (user?.role === 'provider') {
    return <ProviderDashboard user={user} headerAnim={headerAnim} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Assalam-o-Alaikum</Text>
              <Text style={styles.name}>{userName}</Text>
            </View>
            <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
              <Ionicons name="person-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {unratedBooking && (
          <GlassCard style={styles.rateServiceBanner}>
            <View style={styles.rateServiceHeader}>
              <Ionicons name="sparkles" size={22} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.rateServiceTitle}>Rate Completed Service! 🌟</Text>
            </View>
            <Text style={styles.rateServiceText}>
              Your {unratedBooking.service_type.replace('_', ' ')} service by {unratedBooking.provider_name} is completed. How was your experience?
            </Text>
            <TouchableOpacity
              style={styles.rateNowBtn}
              onPress={() => {
                setRating(5);
                setReviewComment('');
                setShowRatingModal(true);
              }}
            >
              <Text style={styles.rateNowBtnText}>⭐ Rate Service</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        <GlassCard style={styles.aiPromptContainer}>
        <Ionicons name="sparkles" size={24} color={colors.accent} style={styles.aiPromptIcon} />
        <TextInput
          style={styles.aiInput}
          placeholder='Try "Mujhe kal subah AC technician chahiye"'
          placeholderTextColor={colors.textMuted}
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={handleAISearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.aiSearchButton} onPress={handleAISearch}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </GlassCard>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
        {promos.map((promo, i) => (
          <GlassCard key={i} style={[styles.promoCard, { borderColor: promo.color + '30' }]}>
            <Ionicons name={promo.icon as any} size={28} color={promo.color} style={{ marginBottom: 8 }} />
            <Text style={styles.promoTitle}>{promo.title}</Text>
            <Text style={styles.promoDesc}>{promo.desc}</Text>
          </GlassCard>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.categoriesGrid}>
        {categories.map((cat, i) => (
          <Animated.View key={cat.title} style={[styles.categoryWrap, i % 4 === 3 && { marginRight: 0 }, getAnimStyle(i)]}>
            <TouchableOpacity
              style={[styles.categoryCard, { borderColor: cat.color + '30' }]}
              onPress={() => router.push({ pathname: '/provider-results', params: { service: cat.service } } as any)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {quickActions.map((action, i) => (
          <Animated.View key={action.title} style={[styles.actionWrap, i % 2 === 1 && { marginRight: 0 }, getAnimStyle(categories.length + i)]}>
            <TouchableOpacity
              style={[styles.actionCard, { borderColor: action.color + '40' }]}
              onPress={() => router.push(action.route as any)}
            >
              <Ionicons name={action.icon as any} size={28} color={action.color} style={{ marginBottom: 8 }} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recentBookings.length === 0 && (
        <Text style={{ color: colors.textMuted, paddingHorizontal: 16, marginTop: 8 }}>No recent activity.</Text>
      )}
      {recentBookings.map((booking: Booking, i: number) => {
        const animIndex = categories.length + quickActions.length + i;
        const opacityAnim = staggerAnims[animIndex] || 1;
        
        const transformStyle = opacityAnim instanceof Animated.Value 
          ? [{ translateY: opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] 
          : [];

        return (
        <Animated.View key={booking.booking_id} style={{ opacity: opacityAnim, transform: transformStyle as any }}>
          <GlassCard style={styles.bookingCard}>
            <View style={styles.bookingRow}>
              <View>
                <Text style={styles.bookingService}>{booking.service_type}</Text>
                <Text style={styles.bookingLocation}>{booking.location}</Text>
                <Text style={styles.bookingDate}>{new Date(booking.created_at).toLocaleDateString()}</Text>
              </View>
              <View style={styles.bookingRight}>
                <Text style={styles.bookingPrice}>PKR {booking.pricing.total_pkr}</Text>
                <View style={[styles.statusBadge, { backgroundColor: booking.status === 'completed' ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)' }]}>
                  <Text style={[styles.statusText, { color: booking.status === 'completed' ? colors.success : colors.warning }]}>
                    {booking.status === 'completed' ? 'Done' : 'Active'}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
        );
      })}
      </ScrollView>

      {/* Rating Modal */}
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
                  How was the service provided by {unratedBooking?.provider_name}?
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
                    if (unratedBooking && user) {
                      reviewMutation.mutate({
                        provider_id: unratedBooking.provider_id,
                        user_id: user.id,
                        rating,
                        comment: reviewComment,
                        booking_id: unratedBooking.booking_id,
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
  content: { paddingHorizontal: H_PADDING, paddingTop: 50, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { color: colors.textSecondary, fontSize: 14 },
  name: { color: colors.textPrimary, fontSize: 26, fontWeight: '700' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.accent + '30',
  },
  aiPromptContainer: {
    flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 16, marginBottom: 20,
    borderColor: colors.accent + '50', borderWidth: 1, borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  aiPromptIcon: { marginRight: 12 },
  aiInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    height: 48,
  },
  aiSearchButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
  promoScroll: { marginBottom: 20, marginLeft: -H_PADDING, paddingLeft: H_PADDING },
  promoCard: {
    padding: 14, marginRight: 12, minWidth: 180,
    borderWidth: 1,
  },
  promoTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  promoDesc: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 12, marginTop: 4 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  categoryWrap: { width: CAT_W, marginRight: GRID_GAP, marginBottom: GRID_GAP },
  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16, borderWidth: 1,
    paddingVertical: 14, alignItems: 'center',
    width: '100%',
  },
  categoryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  categoryTitle: { color: colors.textPrimary, fontSize: 11, fontWeight: '500' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  actionWrap: { width: ACTION_W, marginRight: GRID_GAP, marginBottom: GRID_GAP },
  actionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, borderWidth: 1,
    padding: 16, alignItems: 'center',
    width: '100%',
  },
  actionTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  bookingCard: { marginBottom: 10 },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingService: { color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  bookingLocation: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  bookingDate: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  bookingRight: { alignItems: 'flex-end' },
  bookingPrice: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  providerBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center'
  },
  rateServiceBanner: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD70030',
    backgroundColor: 'rgba(255, 215, 0, 0.03)',
    marginBottom: 20,
  },
  rateServiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateServiceTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
  },
  rateServiceText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  rateNowBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateNowBtnText: {
    color: '#1E1E1E',
    fontSize: 14,
    fontWeight: '700',
  },
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
    maxHeight: '80%',
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
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 12,
    textTransform: 'uppercase',
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
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
