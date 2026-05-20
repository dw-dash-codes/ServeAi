import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { colors, USE_NATIVE_DRIVER } from '../../theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const typeIcons: Record<string, string> = {
  booking_confirmed: '✅', provider_assigned: '👨‍🔧', provider_en_route: '🚗',
  service_completed: '🎉', payment_receipt: '🧾', reminder: '⏰',
  cancellation: '❌', dispute_update: '⚖️', price_update: '💰',
};

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => getNotifications(user?.id),
    enabled: !!user?.id,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates!
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }).start();
  }, []);

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <Text style={styles.pageTitle}>Notifications</Text>
        </View>
        <EmptyState icon="🔔" title="All clear" message="You have no notifications at this time" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.pageTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadCountBadge}>
            <Text style={styles.unreadCountText}>{unreadCount} new</Text>
          </View>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notification_id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item, index }) => (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30 + index * 10, 0] }) }] }}>
            <TouchableOpacity
              onPress={() => { if (!item.read) markRead.mutate(item.notification_id); }}
            >
              <GlassCard style={[styles.notifCard, !item.read && styles.unreadCard]}>
                <View style={styles.notifRow}>
                  <Text style={styles.notifIcon}>{typeIcons[item.type] || '📢'}</Text>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifBody}>{item.body}</Text>
                    <Text style={styles.notifTime}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 8,
  },
  pageTitle: { color: colors.textPrimary, fontSize: 28, fontWeight: '700', flex: 1 },
  unreadCountBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  unreadCountText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  notifCard: { marginBottom: 10 },
  unreadCard: { borderColor: colors.accent + '40' },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start' },
  notifIcon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  unreadTitle: { fontWeight: '700' },
  notifBody: { color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 },
  notifTime: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 4 },
});
