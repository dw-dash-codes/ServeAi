import React, { useState } from 'react';
import { CustomAlert as Alert } from '../components/ui/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { getPaymentMethods, addPaymentMethod, removePaymentMethod } from '../services/api';
import { PaymentMethod } from '../types';

const PAYMENT_TYPES = [
  { id: 'jazzcash', label: 'JazzCash', icon: '📱' },
  { id: 'easypaisa', label: 'EasyPaisa', icon: '💳' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
  { id: 'card', label: 'Credit/Debit', icon: '💳' },
];

export default function PaymentMethodsScreen() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [accountRef, setAccountRef] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
  });

  const addMut = useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setShowAdd(false);
      setSelectedType('');
      setAccountRef('');
    },
  });

  const removeMut = useMutation({
    mutationFn: removePaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });

  const methods = data?.methods || [];

  const handleAdd = () => {
    if (!selectedType || !accountRef.trim()) {
      Alert.alert('Error', 'Please select a payment type and enter account details');
      return;
    }
    addMut.mutate({ type: selectedType, details: { account: accountRef.trim() } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
      </View>

      {methods.length === 0 && !showAdd ? (
        <EmptyState icon="💳" title="No payment methods" message="Add a payment method to book services" />
      ) : (
        methods.map((method: PaymentMethod) => {
          const pt = PAYMENT_TYPES.find((p) => p.id === method.type);
          return (
            <GlassCard key={method.id} style={styles.methodCard}>
              <View style={styles.methodRow}>
                <Text style={styles.methodIcon}>{pt?.icon || '💳'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodType}>{pt?.label || method.type}</Text>
                  <Text style={styles.methodDetail}>
                    {method.details?.account as string || ''}
                  </Text>
                </View>
                {method.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => {
                    Alert.alert('Remove', 'Remove this payment method?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => removeMut.mutate(method.id) },
                    ]);
                  }}
                >
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          );
        })
      )}

      {showAdd ? (
        <GlassCard style={styles.addCard}>
          <Text style={styles.addTitle}>Add Payment Method</Text>
          <Text style={styles.addLabel}>Select Type</Text>
          <View style={styles.typeGrid}>
            {PAYMENT_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.id}
                style={[styles.typeChip, selectedType === pt.id && styles.typeChipActive]}
                onPress={() => setSelectedType(pt.id)}
              >
                <Text style={styles.typeIcon}>{pt.icon}</Text>
                <Text style={[styles.typeLabel, selectedType === pt.id && styles.typeLabelActive]}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.addLabel}>Account / Reference</Text>
          <TextInput
            style={styles.input}
            value={accountRef}
            onChangeText={setAccountRef}
            placeholder="e.g. 0300-1234567"
            placeholderTextColor={colors.textMuted}
          />
          <AnimatedButton title="Save Payment Method" onPress={handleAdd} />
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </GlassCard>
      ) : (
        <AnimatedButton
          title="+ Add Payment Method"
          onPress={() => setShowAdd(true)}
          style={{ marginTop: 8 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  methodCard: { marginBottom: 10 },
  methodRow: { flexDirection: 'row', alignItems: 'center' },
  methodIcon: { fontSize: 28, marginRight: 12 },
  methodType: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  methodDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  defaultBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 8,
  },
  defaultText: { color: colors.accent, fontSize: 10, fontWeight: '600' },
  removeBtn: { padding: 6 },
  removeIcon: { color: colors.error, fontSize: 16 },
  addCard: { marginTop: 16, padding: 16 },
  addTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 16 },
  addLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  typeChipActive: { backgroundColor: colors.accent + '20', borderColor: colors.accent },
  typeIcon: { fontSize: 18, marginRight: 6 },
  typeLabel: { color: colors.textSecondary, fontSize: 13 },
  typeLabelActive: { color: colors.accent, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, padding: 14,
    color: colors.textPrimary, fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  cancelText: { color: colors.textSecondary, fontSize: 14 },
});
