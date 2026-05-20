import React, { useState, useRef, useEffect } from 'react';
import { CustomAlert as Alert } from '../components/ui/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, TextInput, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, USE_NATIVE_DRIVER } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { ProviderHeatScore } from '../components/provider/ProviderHeatScore';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { getProviderById, toggleFavorite, createBooking, calculateDynamicPricing } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import * as Location from 'expo-location';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState<any>(null);
  const [readableLocation, setReadableLocation] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => getProviderById(id),
    enabled: !!id,
  });

  const favMut = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: (res) => setIsFavorite(res.is_favorite),
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, []);

  const bookMut = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowBooking(false);
      
      const alertTitle = 'Booking Confirmed!';
      const alertMsg = `Successfully booked ${provider?.name} at ${selectedSlot}`;
      
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`${alertTitle}\n\n${alertMsg}`);
        }
        setSelectedSlot('');
        router.push('/(tabs)/bookings');
      } else {
        setSelectedSlot('');
        Alert.alert(alertTitle, alertMsg, [
          { text: 'View Bookings', onPress: () => router.push('/(tabs)/bookings') },
        ]);
      }
    },
    onError: (err: any) => {
      console.error('Manual booking mutation failed:', err);
      const errorMsg = 'Please try again later.';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
          (globalThis as any).alert(`Booking Failed\n\n${errorMsg}`);
        }
      } else {
        Alert.alert('Booking Failed', errorMsg);
      }
    }
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
          </TouchableOpacity>
          <Text style={styles.title}>Provider</Text>
        </View>
        <View style={{ padding: 20 }}>
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </View>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { marginTop: 50, marginLeft: 20 }]}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 80 }}>Provider not found</Text>
      </View>
    );
  }



  const handleBook = () => {
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please choose a time slot');
      return;
    }
    if (provider) {
      bookMut.mutate({
        user_id: user?.id,
        provider_id: provider.provider_id,
        service_type: provider.service_categories[0] || 'Service',
        preferred_time: selectedSlot,
        location: readableLocation || dynamicPrice?.origin || 'Current Location',
        pricing: dynamicPrice ? {
          base_rate: dynamicPrice.base_rate,
          travel_fee: dynamicPrice.distance_fee,
          urgency_multiplier: 1,
          complexity_adjustment: 0,
          surge_pricing: 0,
          total_pkr: dynamicPrice.total_amount
        } : undefined
      });
    }
  };

  const handleOpenBooking = async () => {
    setShowBooking(true);
    if (dynamicPrice) return;
    setIsCalculatingPrice(true);
    try {
      let userLoc;
      let addressStr = '';
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          userLoc = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          
          let geocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });
          
          if (geocode && geocode.length > 0) {
            const addr = geocode[0];
            addressStr = [addr.street, addr.city].filter(Boolean).join(', ');
          }
        }
      } catch (e) {
        console.warn('Location permission error:', e);
      }
      
      if (addressStr) {
        setReadableLocation(addressStr);
      } else {
        setReadableLocation('Current Location');
      }
      
      if (provider) {
        const priceData = await calculateDynamicPricing(userLoc, provider.provider_id);
        setDynamicPrice(priceData);
      }
    } catch (e) {
      console.warn('Pricing calculation failed:', e);
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const todaySlots = provider.availability_slots?.[0]?.slots || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
          </TouchableOpacity>
          <Text style={styles.title}>Provider</Text>
          <TouchableOpacity onPress={() => { setIsFavorite(!isFavorite); favMut.mutate(provider.provider_id); }}>
            <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmoji}>👨‍🔧</Text>
          </View>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.category}>{provider.service_categories.join(', ')}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {provider.rating}</Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/provider-reviews', params: { id: provider.provider_id, name: provider.name } })}
            >
              <Text style={styles.reviewsLink}>({provider.review_count} reviews) <Ionicons name="arrow-forward" size={12} color={colors.accent} /></Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesRow}>
            {provider.is_available && (
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>Available Now</Text>
              </View>
            )}
            <Text style={styles.phone}>📞 {provider.phone}</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.scoresCard}>
          <Text style={styles.sectionTitle}>Performance Scores</Text>
          <ProviderHeatScore score={provider.reliability_score} label="Reliability" />
          <ProviderHeatScore score={provider.on_time_score} label="On-Time" />
          <ProviderHeatScore score={1 - provider.cancellation_risk} label="Completion Rate" />
        </GlassCard>

        <GlassCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base Rate</Text>
            <Text style={styles.infoValue}>PKR {provider.base_rate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{provider.distance_km} km</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Travel Time</Text>
            <Text style={styles.infoValue}>{provider.estimated_travel_minutes} min</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service Areas</Text>
            <Text style={styles.infoValue}>{provider.areas.join(', ')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Complexity</Text>
            <Text style={styles.infoValue}>{provider.complexity_supported.join(', ')}</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          {todaySlots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {todaySlots.map((slot: { start: string; end: string; booked: boolean }, idx: number) => (
                <View
                  key={idx}
                  style={[styles.slotChip, slot.booked && styles.slotChipBooked]}
                >
                  <Text style={[styles.slotText, slot.booked && styles.slotTextBooked]}>
                    {slot.start}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Check back for available slots</Text>
          )}
        </GlassCard>

        {user?.role !== 'provider' && (
          <AnimatedButton
            title="📅 Book This Provider"
            onPress={handleOpenBooking}
            style={{ marginBottom: 32 }}
          />
        )}
      </Animated.View>

      <Modal visible={showBooking} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book {provider.name}</Text>
            <Text style={styles.modalSubtitle}>Select a time slot</Text>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChipSelectable, selectedSlot === slot && styles.slotChipSelected]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotTextSelectable, selectedSlot === slot && styles.slotTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {isCalculatingPrice ? (
              <Text style={{color: colors.textSecondary, textAlign: 'center', marginVertical: 16}}>Calculating dynamic pricing based on location...</Text>
            ) : dynamicPrice ? (
              <View style={{marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 8}}>
                {readableLocation && readableLocation !== 'Current Location' && (
                  <View style={[styles.modalPriceRow, {borderTopWidth: 0, paddingVertical: 4}]}>
                    <Text style={styles.modalPriceLabel}>Your Location</Text>
                    <Text style={[styles.modalPriceLabel, {color: colors.textPrimary}]}>{readableLocation}</Text>
                  </View>
                )}
                <View style={[styles.modalPriceRow, {borderTopWidth: 0, paddingVertical: 4}]}>
                  <Text style={styles.modalPriceLabel}>Base Rate</Text>
                  <Text style={styles.modalPriceLabel}>PKR {dynamicPrice.base_rate}</Text>
                </View>
                <View style={[styles.modalPriceRow, {borderTopWidth: 0, paddingVertical: 4}]}>
                  <Text style={styles.modalPriceLabel}>Distance Fee ({dynamicPrice.distance_km} km)</Text>
                  <Text style={styles.modalPriceLabel}>PKR {dynamicPrice.distance_fee}</Text>
                </View>
                <View style={[styles.modalPriceRow, {borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', marginTop: 8, paddingVertical: 12}]}>
                  <Text style={[styles.modalPriceLabel, {color: colors.textPrimary, fontWeight: '700'}]}>Total Amount</Text>
                  <Text style={styles.modalPrice}>PKR {dynamicPrice.total_amount}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPriceLabel}>Estimated Price</Text>
                <Text style={styles.modalPrice}>PKR {provider?.base_rate}</Text>
              </View>
            )}
            <AnimatedButton title={bookMut.isPending ? "Booking..." : "Confirm Booking"} onPress={handleBook} disabled={bookMut.isPending} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBooking(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', flex: 1 },
  favIcon: { fontSize: 24 },
  profileCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  avatarLarge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarEmoji: { fontSize: 32 },
  name: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  category: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  rating: { color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  reviewsLink: { color: colors.accent, fontSize: 13, fontWeight: '500' },
  badgesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  availableBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  availableDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 6,
  },
  availableText: { color: colors.success, fontSize: 12, fontWeight: '500' },
  phone: { color: colors.accent, fontSize: 13 },
  scoresCard: { marginBottom: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  infoCard: { marginBottom: 16 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: { color: colors.textSecondary, fontSize: 14 },
  infoValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  slotChipBooked: { opacity: 0.3 },
  slotText: { color: colors.textPrimary, fontSize: 13 },
  slotTextBooked: { textDecorationLine: 'line-through' },
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 16 },
  slotChipSelectable: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  slotChipSelected: { backgroundColor: colors.accent + '20', borderColor: colors.accent },
  slotTextSelectable: { color: colors.textPrimary, fontSize: 13 },
  slotTextSelected: { color: colors.accent, fontWeight: '600' },
  modalPriceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 16, marginTop: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  modalPriceLabel: { color: colors.textSecondary, fontSize: 14 },
  modalPrice: { color: colors.accent, fontSize: 18, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  cancelText: { color: colors.textSecondary, fontSize: 14 },
});
