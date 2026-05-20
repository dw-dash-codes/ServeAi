import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, createShadow } from '../../theme';

interface PipelineStep {
  name: string;
  icon: string;
  status: 'pending' | 'active' | 'completed';
}

interface OrchestrationPipelineProps {
  steps: PipelineStep[];
}

export function OrchestrationPipeline({ steps }: OrchestrationPipelineProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step.name} style={styles.stepRow}>
          <View style={styles.leftCol}>
            <View
              style={[
                styles.dot,
                step.status === 'completed' && styles.dotCompleted,
                step.status === 'active' && styles.dotActive,
              ]}
            >
              {step.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
              {step.status === 'active' && <Text style={styles.pulseIcon}>●</Text>}
            </View>
            {index < steps.length - 1 && <View style={styles.line} />}
          </View>
          <View
            style={[
              styles.card,
              step.status === 'active' && styles.cardActive,
              step.status === 'completed' && styles.cardCompleted,
            ]}
          >
            <Text style={styles.cardIcon}>{step.icon}</Text>
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.cardTitle,
                  step.status === 'active' && styles.cardTitleActive,
                ]}
              >
                {step.name}
              </Text>
              <Text style={styles.cardStatus}>
                {step.status === 'completed'
                  ? 'Done'
                  : step.status === 'active'
                  ? 'In Progress...'
                  : 'Waiting'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 72,
  },
  leftCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotCompleted: {
    backgroundColor: colors.accent,
  },
  dotActive: {
    backgroundColor: colors.accentLight,
    ...createShadow(colors.accent, 0, 0, 0.8, 8, 4),
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  pulseIcon: {
    color: '#fff',
    fontSize: 10,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    marginBottom: 8,
  },
  cardActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(138,154,91,0.08)',
  },
  cardCompleted: {
    borderColor: 'rgba(76,175,80,0.3)',
    backgroundColor: 'rgba(76,175,80,0.05)',
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  cardTitleActive: {
    color: colors.textPrimary,
  },
  cardStatus: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});

export type { PipelineStep };
