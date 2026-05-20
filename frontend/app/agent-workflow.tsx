import React, { useEffect } from 'react';
import { CustomAlert as Alert } from '../components/ui/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { OrchestrationPipeline, PipelineStep } from '../components/agent/OrchestrationPipeline';
import { useAgentStore } from '../store/useAgentStore';
import { useBookingStore } from '../store/useBookingStore';

const agentFlow: { name: string; icon: string; stage: string }[] = [
  { name: 'Intent Parser', icon: '🧠', stage: 'parsing' },
  { name: 'Discovery Agent', icon: '🔍', stage: 'discovering' },
  { name: 'Ranking Agent', icon: '📊', stage: 'ranking' },
  { name: 'Pricing Agent', icon: '💰', stage: 'pricing' },
  { name: 'Booking Agent', icon: '✅', stage: 'booking' },
  { name: 'Follow-Up Agent', icon: '🔄', stage: 'follow_up' },
];

export default function AgentWorkflowScreen() {
  const currentStage = useAgentStore((s) => s.currentStage);
  const isRunning = useAgentStore((s) => s.isRunning);
  const setCurrentStage = useAgentStore((s) => s.setCurrentStage);
  const setIsRunning = useAgentStore((s) => s.setIsRunning);
  const currentResponse = useBookingStore((s) => s.currentResponse);

  useEffect(() => {
    if (!currentResponse) {
      router.replace('/ai-request');
      return;
    }

    const sequence = async () => {
      const stages = ['parsing', 'discovering', 'ranking', 'pricing', 'booking', 'follow_up'];
      for (const stage of stages) {
        setCurrentStage(stage as any);
        await new Promise((r) => setTimeout(r, 800));
      }
      setCurrentStage('completed');
      setIsRunning(false);
    };

    sequence();
  }, []);

  useEffect(() => {
    if (currentResponse && !isRunning) {
      if (currentResponse.execution_payload) {
        // AI successfully auto-booked
        const provider = currentResponse.recommended_provider?.provider;
        const booking = currentResponse.execution_payload;
        
        let details = "";
        if (provider) {
          details += `Provider: ${provider.name} (⭐ ${provider.rating})\n`;
          if (provider.phone) {
            details += `Contact: ${provider.phone}\n`;
          }
        }
        if (booking) {
          details += `Service: ${booking.service_type.toUpperCase().replace('_', ' ')}\n`;
          details += `Location: ${booking.location}\n`;
          details += `Time: ${booking.preferred_time}\n`;
          details += `Total Price: PKR ${booking.pricing?.total_pkr?.toLocaleString() || 0}\n`;
        }

        const alertTitle = "Booking Confirmed 🎉";
        const alertMsg = `Your booking has been successfully confirmed!\n\n${details}\nKindly check My Bookings for tracking and details.`;
        
        if (Platform.OS === 'web') {
          if (typeof globalThis !== 'undefined' && (globalThis as any).alert) {
            (globalThis as any).alert(`${alertTitle}\n\n${alertMsg}`);
          }
          router.push('/(tabs)/bookings');
        } else {
          Alert.alert(
            alertTitle,
            alertMsg,
            [
              {
                text: "OK",
                onPress: () => router.push('/(tabs)/bookings')
              }
            ]
          );
        }
      } else {
        // AI just found recommendations without booking
        router.push('/provider-results');
      }
    }
  }, [currentStage, currentResponse, isRunning]);

  const getStatus = (stage: string): PipelineStep['status'] => {
    const stageOrder = ['parsing', 'discovering', 'ranking', 'pricing', 'booking', 'follow_up'];
    const currentIdx = stageOrder.indexOf(currentStage);
    const stageIdx = stageOrder.indexOf(stage);
    if (stageIdx < currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'active';
    return 'pending';
  };

  const steps: PipelineStep[] = agentFlow.map((agent) => ({
    name: agent.name,
    icon: agent.icon,
    status: getStatus(agent.stage),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 4}}><Ionicons name="arrow-back" size={16} color={colors.accent} /><Text style={styles.backText}>Back</Text></View>
        </TouchableOpacity>
        <Text style={styles.title}>AI Orchestration</Text>
      </View>

      <ScrollView style={styles.content}>
        <GlassCard style={styles.statusCard}>
          <Text style={styles.statusTitle}>Multi-Agent Pipeline</Text>
          <Text style={styles.statusSubtitle}>
            {currentStage === 'completed'
              ? 'All agents completed'
              : 'Processing your request...'}
          </Text>
        </GlassCard>

        <OrchestrationPipeline steps={steps} />

        <View style={{ marginTop: 16 }}>
          <GlassCard style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              ServeAi uses 7 specialized AI agents working together to process your
              request from understanding to booking confirmation. Each agent handles
              a specific task in the pipeline.
            </Text>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
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
  statusCard: { marginBottom: 20, alignItems: 'center', paddingVertical: 20 },
  statusTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' },
  statusSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  infoCard: { padding: 16, marginBottom: 20 },
  infoTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  infoText: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
