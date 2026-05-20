import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { PricingBreakdown } from '../../types';

interface PricingBreakdownCardProps {
  pricing: PricingBreakdown;
}

export function PricingBreakdownCard({ pricing }: PricingBreakdownCardProps) {
  const rows = [
    { label: 'Base Rate', value: pricing.base_rate },
    { label: 'Travel Fee', value: pricing.travel_fee },
    { label: 'Urgency Multiplier', value: `x${pricing.urgency_multiplier}`, isMultiplier: true },
    { label: 'Complexity Adjustment', value: `x${pricing.complexity_adjustment}`, isMultiplier: true },
  ];

  if (pricing.surge_pricing > 0) {
    rows.push({ label: 'Surge Pricing', value: pricing.surge_pricing });
  }

  return (
    <GlassCard style={styles.card}>
      <Text style={styles.title}>Price Breakdown</Text>
      <View style={styles.divider} />
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>
            {row.isMultiplier ? row.value : `PKR ${row.value}`}
          </Text>
        </View>
      ))}
      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>PKR {pricing.total_pkr}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
});
