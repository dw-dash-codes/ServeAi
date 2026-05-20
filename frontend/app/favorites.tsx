import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { getProviders, toggleFavorite } from '../services/api';
import { Provider } from '../types';

export default function FavoritesScreen() {
  const queryClient = useQueryClient();
  const { data: providersData, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => getProviders(),
  });

  const toggleMut = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });

  const allProviders = providersData?.providers || [];
  const favorites = allProviders.filter((p: Provider) => true);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
          </TouchableOpacity>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={{ padding: 20 }}>
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.count}>{favorites.length} saved</Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState icon="❤️" title="No favorites yet" message="Save providers you like for quick access" />
      ) : (
        favorites.map((provider: Provider) => (
          <TouchableOpacity
            key={provider.provider_id}
            onPress={() => router.push({ pathname: '/provider-detail', params: { id: provider.provider_id } })}
          >
            <GlassCard style={styles.providerCard}>
              <View style={styles.providerRow}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarEmoji}>👨‍🔧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerCategory}>{provider.service_categories.join(', ')}</Text>
                  <Text style={styles.providerRating}>⭐ {provider.rating} · {provider.distance_km} km</Text>
                </View>
                <TouchableOpacity
                  style={styles.favButton}
                  onPress={() => toggleMut.mutate(provider.provider_id)}
                >
                  <Text style={styles.favIcon}>❤️</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))
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
  count: { color: colors.textSecondary, fontSize: 13 },
  providerCard: { marginBottom: 10 },
  providerRow: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarEmoji: { fontSize: 22 },
  providerName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  providerCategory: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  providerRating: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  favButton: { padding: 8 },
  favIcon: { fontSize: 22 },
});
