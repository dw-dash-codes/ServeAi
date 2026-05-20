import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface ProviderHeatScoreProps {
  score: number;
  label: string;
}

export function ProviderHeatScore({ score, label }: ProviderHeatScoreProps) {
  const getColor = (val: number) => {
    if (val >= 0.8) return colors.success;
    if (val >= 0.5) return colors.warning;
    return colors.error;
  };

  const barColor = getColor(score);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: barColor }]}>
          {Math.round(score * 100)}%
        </Text>
      </View>
      <View style={styles.barBg}>
        <View
          style={[
            styles.bar,
            { width: `${Math.round(score * 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  barBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
});
