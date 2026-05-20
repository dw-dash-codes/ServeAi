import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { colors, USE_NATIVE_DRIVER } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { createDispute } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

const disputeTypes = [
  { value: 'user_price_dispute', label: 'Price Dispute' },
  { value: 'quality_complaint', label: 'Quality Complaint' },
  { value: 'provider_cancelled', label: 'Provider Cancelled' },
  { value: 'no_show', label: 'No Show' },
  { value: 'other', label: 'Other' },
];

export default function DisputeResolutionScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'user_default';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [bookingId, setBookingId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!bookingId || !selectedType) return;

    setIsSubmitting(true);
    try {
      const response = await createDispute({
        booking_id: bookingId,
        user_id: userId,
        dispute_type: selectedType,
        reason,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }).start();
  }, []);

  if (result) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
          </TouchableOpacity>
          <Text style={styles.title}>Dispute</Text>
        </View>
        <View style={styles.content}>
          <GlassCard style={styles.successCard}>
            <Text style={styles.successIcon}>📋</Text>
            <Text style={styles.successTitle}>Dispute Registered</Text>
            <Text style={styles.successText}>
              Your dispute has been filed. Our team will review it shortly.
            </Text>
            {result.dispute && (
              <Text style={styles.disputeId}>
                Ticket: {result.dispute.dispute_id}
              </Text>
            )}
          </GlassCard>
          <AnimatedButton
            title="Back to Home"
            onPress={() => router.replace('/(tabs)/home')}
            variant="outline"
          />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Dispute</Text>
      </View>

      <ScrollView style={styles.content}>
        <GlassCard style={styles.inputCard}>
          <Text style={styles.inputLabel}>Booking ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter booking ID"
            placeholderTextColor={colors.textMuted}
            value={bookingId}
            onChangeText={setBookingId}
          />
        </GlassCard>

        <Text style={styles.sectionTitle}>Dispute Type</Text>
        <View style={styles.typeGrid}>
          {disputeTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeChip,
                selectedType === type.value && styles.typeChipSelected,
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text
                style={[
                  styles.typeText,
                  selectedType === type.value && styles.typeTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <GlassCard style={styles.inputCard}>
          <Text style={styles.inputLabel}>Reason (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={reason}
            onChangeText={setReason}
          />
        </GlassCard>

        <AnimatedButton
          title={isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          onPress={handleSubmit}
          disabled={!bookingId || !selectedType || isSubmitting}
          variant="secondary"
        />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  content: { flex: 1, padding: 20 },
  inputCard: { marginBottom: 16 },
  inputLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500' },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  typeChipSelected: {
    backgroundColor: 'rgba(107,125,179,0.2)',
    borderColor: colors.slateBlue,
  },
  typeText: { color: colors.textSecondary, fontSize: 13 },
  typeTextSelected: { color: colors.slateBlueLight, fontWeight: '600' },
  successCard: { alignItems: 'center', padding: 32, marginBottom: 16 },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '600', marginBottom: 8 },
  successText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  disputeId: { color: colors.accent, fontSize: 12, fontFamily: 'monospace' },
});
