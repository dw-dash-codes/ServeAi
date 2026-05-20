import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { RankedProvider } from '../../types';

interface ProviderCardProps {
  ranked: RankedProvider;
  onPress?: () => void;
}

export function ProviderCard({ ranked, onPress }: ProviderCardProps) {
  const { provider, rank, scores } = ranked;
  const scorePercent = Math.round(scores.total * 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard style={[styles.card, rank === 1 && styles.topCard]}>
        {rank === 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Top Pick</Text>
          </View>
        )}
        <View style={styles.header}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{provider.name}</Text>
            <Text style={styles.category}>{provider.service_categories.join(', ')}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, scorePercent > 75 && styles.highScore]}>
              {scorePercent}%
            </Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{provider.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{provider.distance_km}km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>PKR {provider.base_rate}</Text>
            <Text style={styles.statLabel}>Base Rate</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{provider.review_count}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    position: 'relative',
  },
  topCard: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(138,154,91,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  info: { flex: 1 },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  highScore: {
    color: colors.accent,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
