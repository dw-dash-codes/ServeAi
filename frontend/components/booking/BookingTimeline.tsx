import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, createShadow } from '../../theme';
import { BookingStatus } from '../../types';

interface TimelineEvent {
  status: BookingStatus;
  label: string;
  timestamp?: string;
}

interface BookingTimelineProps {
  events: TimelineEvent[];
  currentStatus: BookingStatus;
}

const statusOrder: BookingStatus[] = [
  'pending',
  'confirmed',
  'en_route',
  'in_progress',
  'completed',
];

export function BookingTimeline({ events, currentStatus }: BookingTimelineProps) {
  const currentIdx = statusOrder.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const eventIdx = statusOrder.indexOf(event.status);
        const isCompleted = eventIdx <= currentIdx && currentIdx !== -1;
        const isCurrent = event.status === currentStatus;

        return (
          <View key={event.status} style={styles.eventRow}>
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && styles.dotActive,
                ]}
              >
                {isCompleted && !isCurrent && <Text style={styles.check}>✓</Text>}
              </View>
              {index < events.length - 1 && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              )}
            </View>
            <View style={styles.content}>
              <Text
                style={[
                  styles.label,
                  isCompleted && styles.labelCompleted,
                  isCurrent && styles.labelActive,
                ]}
              >
                {event.label}
              </Text>
              {event.timestamp && (
                <Text style={styles.timestamp}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 56,
  },
  leftCol: {
    alignItems: 'center',
    width: 28,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    ...createShadow(colors.accent, 0, 0, 0.6, 8, 4),
  },
  check: { color: '#fff', fontSize: 10, fontWeight: '700' },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: colors.accent,
  },
  content: {
    flex: 1,
    paddingBottom: 12,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  labelCompleted: {
    color: colors.textPrimary,
  },
  labelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
