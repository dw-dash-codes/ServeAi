import React, { useState } from 'react';
import { CustomAlert as Alert } from '../components/ui/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { getReviews, addReview } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Review } from '../types';

const RATING_EMOJIS = ['😡', '😕', '😐', '😊', '🤩'];

export default function ProviderReviewsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showAdd, setShowAdd] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviews(id),
    enabled: !!id,
  });

  const addMut = useMutation({
    mutationFn: addReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setShowAdd(false);
      setNewRating(0);
      setNewComment('');
      Alert.alert('Thank you!', 'Your review has been submitted.');
    },
  });

  const reviews = data?.reviews || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: Review) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleSubmitReview = () => {
    if (newRating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    addMut.mutate({
      provider_id: id!,
      user_id: 'user_default',
      rating: newRating,
      comment: newComment,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
      </View>

      {isLoading ? (
        <View><CardSkeleton /><CardSkeleton /><CardSkeleton /></View>
      ) : (
        <>
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.bigRating}>{avgRating}</Text>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.starsRow}>
                  {'⭐'.repeat(Math.round(parseFloat(avgRating))) || '⭐'}
                </Text>
                <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
              </View>
            </View>
          </GlassCard>

          {reviews.length === 0 ? (
            <EmptyState icon="💬" title="No reviews yet" message="Be the first to leave a review" />
          ) : (
            reviews.map((review: Review, idx: number) => (
              <GlassCard key={review.review_id || idx} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>
                      {review.user_name || 'Anonymous'}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </GlassCard>
            ))
          )}

          {user?.id !== id && (
            showAdd ? (
              <GlassCard style={styles.addCard}>
                <Text style={styles.addTitle}>Write a Review</Text>
                <Text style={styles.addLabel}>Rating</Text>
                <View style={styles.ratingPicker}>
                  {RATING_EMOJIS.map((emoji, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.ratingOption, newRating === i + 1 && styles.ratingOptionActive]}
                      onPress={() => setNewRating(i + 1)}
                    >
                      <Text style={styles.ratingEmoji}>{emoji}</Text>
                      <Text style={[styles.ratingNum, newRating === i + 1 && styles.ratingNumActive]}>
                        {i + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.addLabel}>Comment (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Share your experience..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
                <AnimatedButton title="Submit Review" onPress={handleSubmitReview} />
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </GlassCard>
            ) : (
              <AnimatedButton
                title="✍️ Write a Review"
                onPress={() => setShowAdd(true)}
                style={{ marginTop: 16 }}
              />
            )
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', flex: 1 },
  summaryCard: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  bigRating: { fontSize: 48, fontWeight: '700', color: colors.textPrimary },
  starsRow: { fontSize: 16 },
  reviewCount: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  reviewCard: { marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  reviewAvatarText: { fontSize: 16 },
  reviewerName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  reviewDate: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  reviewRating: { fontSize: 14 },
  reviewComment: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  addCard: { marginTop: 16, padding: 16 },
  addTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 },
  addLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 12 },
  ratingPicker: { flexDirection: 'row', gap: 8 },
  ratingOption: {
    alignItems: 'center', padding: 10,
    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flex: 1,
  },
  ratingOptionActive: { backgroundColor: colors.accent + '20', borderColor: colors.accent },
  ratingEmoji: { fontSize: 24 },
  ratingNum: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  ratingNumActive: { color: colors.accent, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, padding: 14,
    color: colors.textPrimary, fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 80, textAlignVertical: 'top', marginBottom: 16,
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  cancelText: { color: colors.textSecondary, fontSize: 14 },
});
