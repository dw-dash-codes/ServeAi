import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface RankingBadgeProps {
  rank: number;
  total?: number;
}

export function RankingBadge({ rank, total }: RankingBadgeProps) {
  const getColor = () => {
    if (rank === 1) return colors.accent;
    if (rank === 2) return colors.slateBlue;
    if (rank === 3) return '#CD7F32';
    return colors.textMuted;
  };

  return (
    <View style={[styles.badge, { backgroundColor: `${getColor()}20`, borderColor: getColor() }]}>
      <Text style={[styles.rank, { color: getColor() }]}>#{rank}</Text>
      {total && <Text style={styles.total}>of {total}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  rank: {
    fontSize: 14,
    fontWeight: '700',
  },
  total: {
    color: colors.textMuted,
    fontSize: 11,
    marginLeft: 4,
  },
});
