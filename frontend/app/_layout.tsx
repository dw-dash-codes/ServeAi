import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomAlertComponent, customAlertRef } from '../components/ui/CustomAlert';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1E1E1E' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="ai-request" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="agent-workflow" />
          <Stack.Screen name="provider-results" />
          <Stack.Screen name="booking-confirmation" options={{ animation: 'fade' }} />
          <Stack.Screen name="booking-tracking" />
          <Stack.Screen name="pricing-breakdown" options={{ presentation: 'modal' }} />
          <Stack.Screen name="dispute-resolution" />
          <Stack.Screen name="booking-history" />
          <Stack.Screen name="provider-detail" />
          <Stack.Screen name="provider-reviews" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="payment-methods" />
        </Stack>
        <CustomAlertComponent ref={customAlertRef} />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
});
