import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingStatus } from '../../types';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#FF9800', bg: '#FFF3E0' },
  confirmed: { label: 'Confirmed', color: '#4CAF50', bg: '#E8F5E9' },
  en_route: { label: 'En Route', color: '#2196F3', bg: '#E3F2FD' },
  in_progress: { label: 'In Progress', color: '#9C27B0', bg: '#F3E5F5' },
  completed: { label: 'Completed', color: '#4CAF50', bg: '#E8F5E9' },
  cancelled: { label: 'Cancelled', color: '#F44336', bg: '#FFEBEE' },
  rejected: { label: 'Rejected', color: '#F44336', bg: '#FFEBEE' },
  disputed: { label: 'Disputed', color: '#F44336', bg: '#FFEBEE' },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
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
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
