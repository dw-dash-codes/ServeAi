import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';
import { colors } from '../theme';
import { useAuthStore } from '../store/useAuthStore';
import { getCategories } from '../services/api';

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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user'|'provider'>('user');
  const [category, setCategory] = useState(FALLBACK_CATEGORIES[0].value);
  const [baseRate, setBaseRate] = useState('1500');
  const [serviceAreas, setServiceAreas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signup = useAuthStore((s) => s.signup);
  
  const [availableCategories, setAvailableCategories] = useState<{label: string, value: string}[]>(FALLBACK_CATEGORIES);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (role === 'provider') {
      getCategories().then(res => {
        if (res.categories && res.categories.length > 0) {
          setAvailableCategories(res.categories);
        }
      }).catch(err => console.error('Failed to load categories dynamically', err));
    }
  }, [role]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required');
      return;
    }
    if (role === 'provider' && (!baseRate.trim() || isNaN(Number(baseRate)) || Number(baseRate) <= 0)) {
      setError('Please enter a valid service fee/rate');
      return;
    }
    if (role === 'provider' && !serviceAreas.trim()) {
      setError('Please enter at least one service area');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const parsedAreas = role === 'provider'
        ? serviceAreas.split(',').map((a: string) => a.trim()).filter(Boolean)
        : undefined;
      await signup(name, email, phone, password, role, category, role === 'provider' ? Number(baseRate) : undefined, parsedAreas);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/login')} style={styles.back}>
        <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
      </TouchableOpacity>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>🚀</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ServeAi today</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} 
              onPress={() => setRole('user')}
            >
              <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleBtn, role === 'provider' && styles.roleBtnActive]} 
              onPress={() => setRole('provider')}
            >
              <Text style={[styles.roleText, role === 'provider' && styles.roleTextActive]}>Service Provider</Text>
            </TouchableOpacity>
          </View>

          {role === 'provider' && (
            <>
              <Text style={styles.label}>Primary Service Category</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger} 
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownTriggerText}>
                  {availableCategories.find(c => c.value === category)?.label || 'Select Category'}
                </Text>
                <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.accent} />
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
                        category === cat.value && styles.dropdownItemActive
                      ]}
                      onPress={() => {
                        setCategory(cat.value);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        category === cat.value && styles.dropdownItemTextActive
                      ]}>
                        {cat.label}
                      </Text>
                      {category === cat.value && (
                        <Ionicons name="checkmark" size={16} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.label}>Service Fee / Rate (PKR)</Text>
              <TextInput
                style={styles.input}
                value={baseRate}
                onChangeText={setBaseRate}
                placeholder="e.g. 1500"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Service Areas (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={serviceAreas}
                onChangeText={setServiceAreas}
                placeholder="e.g. G-13, F-8, Blue Area"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  content: { flex: 1, padding: 24 },
  scrollContent: { justifyContent: 'center', flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 32 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 15, marginTop: 8 },
  form: { width: '100%' },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    color: colors.textPrimary,
    fontSize: 16,
  },
  dropdownTrigger: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  dropdownMenu: {
    backgroundColor: 'rgba(25, 25, 25, 0.98)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginTop: 8,
    maxHeight: 220,
    overflow: 'hidden',
  },
  dropdownScrollView: {
    flex: 1,
  },
  dropdownItem: {
    padding: 14,
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
    fontSize: 15,
  },
  dropdownItemTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  linkButton: { alignItems: 'center', marginTop: 20 },
  linkText: { color: colors.textMuted, fontSize: 14 },
  linkHighlight: { color: colors.accent, fontWeight: '600' },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center' },
  roleBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + '20' },
  roleText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  roleTextActive: { color: colors.accent, fontWeight: '700' },
});
