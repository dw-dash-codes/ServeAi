import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useBookingStore } from '../store/useBookingStore';
import { getProviders } from '../services/api';
import type { Provider } from '../types';

export default function ProviderResultsScreen() {
  const currentResponse = useBookingStore((s) => s.currentResponse);
  const { service } = useLocalSearchParams<{ service?: string }>();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setLoading(true);
      getProviders({ service })
        .then((data) => setProviders(data.providers.slice(0, 5)))
        .catch(() => setError('Could not load providers'))
        .finally(() => setLoading(false));
    }
  }, [service]);

  if (!currentResponse && !service) {
    router.replace('/ai-request');
    return null;
  }

  const isCategorySearch = !!service;
  const rankings = isCategorySearch ? [] : (currentResponse?.provider_rankings || []);
  const recommended = isCategorySearch ? null : currentResponse?.recommended_provider;
  const displayProviders = rankings.length > 0 ? rankings : providers;

  const handleSelectProvider = () => {
    router.push('/pricing-breakdown');
  };

  const handleViewDetails = (providerId: string) => {
    router.push(`/provider-detail?id=${providerId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Finding providers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <AnimatedButton title="Try AI Request" onPress={() => router.push('/ai-request')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Available Providers</Text>
      </View>

      <ScrollView style={styles.content}>
        {!isCategorySearch && currentResponse?.extracted_intent && (
          <GlassCard style={styles.intentCard}>
            <Text style={styles.intentLabel}>Your Request</Text>
            <Text style={styles.intentText}>
              {currentResponse.extracted_intent.service_type} in{' '}
              {currentResponse.extracted_intent.location}
            </Text>
          </GlassCard>
        )}

        {recommended && (
          <GlassCard style={styles.recommendedCard}>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>★ BEST MATCH</Text>
            </View>
            <Text style={styles.recommendedName}>{recommended.provider.name}</Text>
            <Text style={styles.recommendedScore}>
              Match Score: {(recommended.scores.total * 100).toFixed(0)}%
            </Text>
            <View style={styles.recommendedDetails}>
              <Text style={styles.recommendedDetail}>
                ⭐ {recommended.provider.rating} · {recommended.provider.review_count} reviews
              </Text>
              <Text style={styles.recommendedDetail}>
                📍 {recommended.provider.distance_km} km · {recommended.provider.estimated_travel_minutes} min
              </Text>
              <Text style={styles.recommendedDetail}>
                💰 PKR {recommended.provider.base_rate.toLocaleString()}
              </Text>
            </View>
            <AnimatedButton
              title="Book Now"
              onPress={handleSelectProvider}
              style={{ marginTop: 12 }}
            />
          </GlassCard>
        )}

        <Text style={styles.sectionTitle}>
          {rankings.length > 0 ? 'All Matches' : 'Available Providers'}
        </Text>
        {displayProviders.length === 0 && (
          <Text style={styles.emptyText}>No providers found. Try an AI request instead.</Text>
        )}
        {displayProviders.map((item: any, index: number) => {
          const provider = item.provider || item;
          const rank = item.rank || index + 1;
          const score = item.scores?.total;
          return (
            <TouchableOpacity
              key={provider.provider_id}
              onPress={() => handleViewDetails(provider.provider_id)}
            >
              <GlassCard style={styles.providerCard}>
                <View style={styles.providerHeader}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{rank}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerMeta}>
                      ⭐ {provider.rating} · {provider.distance_km} km
                    </Text>
                  </View>
                  <Text style={styles.providerPrice}>
                    PKR {provider.base_rate?.toLocaleString()}
                  </Text>
                </View>
                {score && (
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreFill, { width: `${(score * 100).toFixed(0)}%` as any }]} />
                  </View>
                )}
                <View style={styles.providerTags}>
                  {provider.areas?.slice(0, 3).map((area: string) => (
                    <View key={area} style={styles.tag}>
                      <Text style={styles.tagText}>{area}</Text>
                    </View>
                  ))}
                  {provider.complexity_supported?.map((c: string) => (
                    <View key={c} style={[styles.tag, styles.tagComplexity]}>
                      <Text style={styles.tagText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { color: colors.textSecondary, fontSize: 14, marginTop: 12 },
  errorText: { color: colors.error, fontSize: 14, marginBottom: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.bg,
  },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  content: { flex: 1, padding: 20 },
  intentCard: { marginBottom: 16, padding: 14 },
  intentLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  intentText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 4 },
  recommendedCard: {
    marginBottom: 24,
    padding: 20,
    borderColor: colors.accent + '40',
    borderWidth: 1,
  },
  recommendedBadge: {
    backgroundColor: colors.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  recommendedBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  recommendedName: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  recommendedScore: { color: colors.accent, fontSize: 14, fontWeight: '600', marginTop: 4 },
  recommendedDetails: { marginTop: 12 },
  recommendedDetail: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 32 },
  providerCard: { marginBottom: 10 },
  providerHeader: { flexDirection: 'row', alignItems: 'center' },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  providerName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  providerMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  providerPrice: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  scoreBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 8,
  },
  scoreFill: {
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  providerTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagComplexity: { backgroundColor: 'rgba(138,154,91,0.15)' },
  tagText: { color: colors.textSecondary, fontSize: 10 },
});
