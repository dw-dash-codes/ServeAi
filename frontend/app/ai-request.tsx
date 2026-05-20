import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useBookingStore } from '../store/useBookingStore';
import { useAgentStore } from '../store/useAgentStore';
import { sendAIRequest } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import * as Location from 'expo-location';

const suggestions = [
  'Mujhe kal subah G-13 mein AC technician chahiye',
  'Need plumber tonight in Bahria Town',
  'Bijli ka masla hai, electrician urgent',
  'Kal 3 baje math tutor chahiye F-8 mein',
];

export default function AIRequestScreen() {
  const { initialPrompt } = useLocalSearchParams<{ initialPrompt?: string }>();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const setCurrentResponse = useBookingStore((s) => s.setCurrentResponse);
  const setTrace = useAgentStore((s) => s.setTrace);
  const setCurrentStage = useAgentStore((s) => s.setCurrentStage);
  const setIsRunning = useAgentStore((s) => s.setIsRunning);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (initialPrompt) {
      setText(initialPrompt);
      // Wait a moment before auto-submitting so UI has time to render
      setTimeout(() => {
        handleSubmit(initialPrompt);
      }, 500);
    }
  }, [initialPrompt]);

  const handleSubmit = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || text;
    if (!finalPrompt.trim() || isProcessing) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentStage('parsing');
    setIsRunning(true);

    try {
      let userLocation;
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          userLocation = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };
        }
      } catch (locErr) {
        console.warn('Could not get location:', locErr);
      }

      const response = await sendAIRequest(finalPrompt, user?.id, userLocation);
      setCurrentResponse(response);
      setTrace(response.agent_trace);

      if (response.clarification_required) {
        setCurrentStage('clarification_needed');
        setErrorMsg(response.clarification_prompt || 'More details needed');
        setIsProcessing(false);
        return;
      }

      if (response.workflow_stage === 'no_providers_found') {
        setCurrentStage('error');
        setErrorMsg('No providers found for your request');
        setIsProcessing(false);
        return;
      }

      router.push('/agent-workflow');
    } catch (error: any) {
      setCurrentStage('error');
      if (error?.message) {
        setErrorMsg(error.message);
      } else if (error?.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg('Could not connect to server. Make sure the backend is running.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setText(suggestion);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>AI Request</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Describe what service you need in any language
        </Text>

        <GlassCard style={styles.inputCard}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type your request..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={text}
            onChangeText={setText}
            autoFocus={!initialPrompt}
          />
        </GlassCard>

        <AnimatedButton
          title={isProcessing ? 'Processing...' : 'Send Request'}
          onPress={() => handleSubmit()}
          disabled={!text.trim() || isProcessing}
          style={{ marginBottom: 8 }}
        />
        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <Text style={styles.suggestionsTitle}>Try these examples:</Text>
        {suggestions.map((suggestion, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.suggestionChip}
              onPress={() => handleSuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
            </View>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: { marginRight: 12 },
  backText: { color: colors.accent, fontSize: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  content: { flex: 1, padding: 20 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginBottom: 20, lineHeight: 20 },
  inputCard: { marginBottom: 16, minHeight: 120 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  micButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  suggestionText: { color: colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  errorBox: {
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.3)',
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center' },
});
