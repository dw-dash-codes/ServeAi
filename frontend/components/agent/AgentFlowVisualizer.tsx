import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, createShadow } from '../../theme';
import { AgentLog, WorkflowStage } from '../../types';
import { AgentStepCard } from './AgentStepCard';

interface AgentFlowVisualizerProps {
  logs: AgentLog[];
  currentStage: WorkflowStage;
}

const stageOrder: WorkflowStage[] = [
  'parsing',
  'discovering',
  'ranking',
  'pricing',
  'booking',
  'follow_up',
];

export function AgentFlowVisualizer({ logs, currentStage }: AgentFlowVisualizerProps) {
  const currentStep = stageOrder.indexOf(currentStage) + 1;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {stageOrder.map((stage, index) => {
          const isDone = stageOrder.indexOf(currentStage) > index;
          const isCurrent = stageOrder.indexOf(currentStage) === index;
          return (
            <View key={stage} style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  isDone && styles.stepDone,
                  isCurrent && styles.stepActive,
                ]}
              />
              {index < stageOrder.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isDone && styles.stepLineDone,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.stageLabel}>
        Step {currentStep} of {stageOrder.length}: {currentStage.replace('_', ' ')}
      </Text>
      <View style={styles.logsContainer}>
        {logs.map((log, index) => (
          <View key={log.log_id}>
            <AgentStepCard
              log={log}
              isActive={index === logs.length - 1 && currentStage !== 'completed'}
              isCompleted={index < logs.length - 1 || currentStage === 'completed'}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  stepDone: {
    backgroundColor: colors.accent,
  },
  stepActive: {
    backgroundColor: colors.accentLight,
    width: 16,
    height: 16,
    borderRadius: 8,
    ...createShadow(colors.accent, 0, 0, 0.6, 8, 4),
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: colors.accent,
  },
  stageLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  logsContainer: {
    marginTop: 8,
  },
});
