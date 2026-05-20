import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { StatusPulse } from '../ui/StatusPulse';
import { AgentLog } from '../../types';

interface AgentStepCardProps {
  log: AgentLog;
  isActive?: boolean;
  isCompleted?: boolean;
}

const agentIcons: Record<string, string> = {
  IntentParserAgent: '🧠',
  ProviderDiscoveryAgent: '🔍',
  MatchingRankingAgent: '📊',
  PricingAgent: '💰',
  BookingExecutionAgent: '✅',
  FollowUpDisputeAgent: '🔄',
};

export function AgentStepCard({ log, isActive, isCompleted }: AgentStepCardProps) {
  const icon = agentIcons[log.agent] || '⚙️';
  const status = isActive ? 'active' : isCompleted ? 'success' : 'inactive';

  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.agentName}>{log.agent.replace(/([A-Z])/g, ' $1').trim()}</Text>
          <Text style={styles.action}>{log.action}</Text>
        </View>
        <StatusPulse status={status} size={8} />
      </View>
      <View style={styles.body}>
        <Text style={styles.decision}>
          <Text style={styles.label}>Decision: </Text>
          {log.decision}
        </Text>
        <Text style={styles.output}>
          <Text style={styles.label}>Output: </Text>
          {JSON.stringify(log.output).substring(0, 100)}
          {JSON.stringify(log.output).length > 100 ? '...' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 8,
  },
  activeCard: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(138, 154, 91, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  icon: { fontSize: 18 },
  info: { flex: 1 },
  agentName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  action: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  decision: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  output: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  label: {
    color: colors.accent,
    fontWeight: '600',
  },
});
