import React, { useState } from 'react';
import { CustomAlert as Alert } from '../../components/ui/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/useAuthStore';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBookings, getCategories, getProviderById } from '../../services/api';


const FALLBACK_CATEGORIES = [
  { label: 'Mechanic', value: 'mechanic' },
  { label: 'Electrician', value: 'electrician' },
  { label: 'Plumber', value: 'plumber' },
  { label: 'AC Technician', value: 'ac_technician' },
  { label: 'Cleaner', value: 'cleaner' },
  { label: 'Carpenter', value: 'carpenter' },
  { label: 'Tutor', value: 'tutor' },
  { label: 'Towing', value: 'towing' },
];

const menuItems = [
  { icon: '📋', title: 'Booking History', route: '/booking-history' },
  { icon: '🔔', title: 'Notifications', route: '/(tabs)/notifications' },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCategory, setEditCategory] = useState((user as any)?.category || 'electrician');
  const [editAreas, setEditAreas] = useState(((user as any)?.areas || []).join(', '));
  const [availableCategories, setAvailableCategories] = useState<{ label: string; value: string }[]>(FALLBACK_CATEGORIES);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', user?.id, user?.role],
    queryFn: () => getBookings(
      user?.role === 'provider' 
        ? { provider_id: user.id } 
        : { user_id: user?.id }
    ),
    enabled: !!user?.id,
  });

  const { data: providerData, refetch: refetchProvider } = useQuery({
    queryKey: ['provider', user?.id],
    queryFn: () => getProviderById(user!.id),
    enabled: !!user?.id && user?.role === 'provider',
  });

  React.useEffect(() => {
    if (providerData && user && !isEditing && !saving) {
      const category = providerData.service_categories?.[0] || 'electrician';
      const areas = providerData.areas || [];
      if (
        (user as any).category !== category ||
        JSON.stringify((user as any).areas) !== JSON.stringify(areas)
      ) {
        useAuthStore.setState({
          user: {
            ...user,
            category,
            areas,
          }
        });
      }
    }
  }, [providerData, isEditing, saving]);
  const bookings = bookingsData?.bookings || [];
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.pricing?.total_pkr || 0), 0);

  React.useEffect(() => {
    if (isEditing && user?.role === 'provider' && availableCategories.length === 0) {
      getCategories().then(res => {
        setAvailableCategories(res.categories);
      }).catch(err => console.error('Failed to load categories', err));
    }
  }, [isEditing, user]);

  React.useEffect(() => {
    if (user && !isEditing) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      const currentCategory = user.role === 'provider' ? (providerData?.service_categories?.[0] || (user as any).category || 'electrician') : 'electrician';
      const currentAreas = user.role === 'provider' ? (providerData?.areas || (user as any).areas || []) : [];
      setEditCategory(currentCategory);
      setEditAreas(currentAreas.join(', '));
    }
  }, [user, providerData, isEditing]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    const parsedAreas = user?.role === 'provider'
      ? editAreas.split(',').map((a: string) => a.trim()).filter(Boolean)
      : undefined;
    const success = await updateProfile({
      name: editName,
      phone: editPhone,
      category: user?.role === 'provider' ? editCategory : undefined,
      areas: parsedAreas,
    });
    if (success) {
      if (user?.role === 'provider') {
        await refetchProvider();
        await queryClient.invalidateQueries({ queryKey: ['providers'] });
      }
      setSaving(false);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      setSaving(false);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = typeof globalThis !== 'undefined' && (globalThis as any).confirm ? (globalThis as any).confirm('Are you sure you want to sign out?') : true;
      if (confirmLogout) {
        logout();
        router.replace('/login');
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isEditing ? (
        <GlassCard style={styles.editCard}>
          <Text style={styles.editTitle}>Edit Profile</Text>
          
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
          />
          
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="Enter phone number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          {user?.role === 'provider' && (
            <>
              <Text style={styles.inputLabel}>Service Category</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger} 
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownTriggerText}>
                  {availableCategories.find(c => c.value === editCategory)?.label || 'Select Category'}
                </Text>
                <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.accent} />
              </TouchableOpacity>

              {showDropdown && (
                <ScrollView 
                  style={styles.dropdownMenu}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {availableCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.dropdownItem,
                        editCategory === cat.value && styles.dropdownItemActive
                      ]}
                      onPress={() => {
                        setEditCategory(cat.value);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        editCategory === cat.value && styles.dropdownItemTextActive
                      ]}>
                        {cat.label}
                      </Text>
                      {editCategory === cat.value && (
                        <Ionicons name="checkmark" size={14} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.inputLabel}>Service Areas (comma-separated)</Text>
              <TextInput
                style={styles.textInput}
                value={editAreas}
                onChangeText={setEditAreas}
                placeholder="e.g. G-13, F-8, Blue Area"
                placeholderTextColor={colors.textMuted}
              />
            </>
          )}

          <View style={styles.editActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]} 
              onPress={() => setIsEditing(false)}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.saveBtn]} 
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>
      ) : (
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmoji}>{user?.avatar || '👤'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+92 300 0000000'}</Text>
          {user?.role === 'provider' && (providerData?.service_categories?.[0] || (user as any)?.category) && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                🛠️ {(providerData?.service_categories?.[0] || (user as any).category).toUpperCase().replace('_', ' ')}
              </Text>
            </View>
          )}
          {user?.role === 'provider' && (providerData?.areas || (user as any)?.areas) && (providerData?.areas || (user as any).areas).length > 0 && (
            <View style={styles.areasBadge}>
              <Text style={styles.areasBadgeText}>
                📍 Serving: {(providerData?.areas || (user as any).areas).join(', ')}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              const currentCategory = providerData?.service_categories?.[0] || (user as any)?.category || 'electrician';
              const currentAreas = providerData?.areas || (user as any)?.areas || [];
              setEditCategory(currentCategory);
              setEditAreas(currentAreas.join(', '));
              setIsEditing(true);
            }}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <GlassCard style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalBookings}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalSpent.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{user?.role === 'provider' ? 'Earned (PKR)' : 'Spent (PKR)'}</Text>
          </View>
        </View>
      </GlassCard>

      <Text style={styles.sectionTitle}>Quick Access</Text>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.title}
          onPress={() => router.push(item.route as any)}
        >
          <GlassCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </GlassCard>
        </TouchableOpacity>
      ))}

      {user?.role === 'provider' && (
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/provider-reviews', params: { id: user.id } })}
        >
          <GlassCard style={styles.menuItem}>
            <Text style={styles.menuIcon}>⭐</Text>
            <Text style={styles.menuTitle}>My Reviews</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </GlassCard>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ServeAi v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 50 },
  editCard: {
    padding: 20,
    marginBottom: 24,
  },
  editTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dropdownTrigger: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  dropdownMenu: {
    backgroundColor: 'rgba(25, 25, 25, 0.98)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginTop: 6,
    maxHeight: 180,
    overflow: 'hidden',
  },
  dropdownScrollView: {
    flex: 1,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dropdownItemText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveBtn: {
    backgroundColor: colors.accent,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.accent + '20',
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  categoryBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  areasBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxWidth: '90%',
  },
  areasBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.accent + '40',
  },
  avatarEmoji: { fontSize: 40 },
  userName: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
  userEmail: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  userPhone: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  editButtonText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  statsCard: { marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  stat: { alignItems: 'center' },
  statValue: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuTitle: { flex: 1, color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  menuArrow: { color: colors.textMuted, fontSize: 16 },
  logoutButton: {
    marginTop: 24,
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.2)',
  },
  logoutText: { color: colors.error, fontSize: 15, fontWeight: '600' },
  version: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
});
