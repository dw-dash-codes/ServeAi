import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useAuthStore } from '../store/useAuthStore';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: '🤖',
    title: 'AI-Powered Service Booking',
    description: 'Just type what you need — "Mujhe kal AC technician chahiye" — and our AI agents handle the rest.',
  },
  {
    id: '2',
    icon: '🧠',
    title: 'Multi-Agent Orchestration',
    description: 'Seven intelligent agents work together to understand, find, rank, price, book, and follow up.',
  },
  {
    id: '3',
    icon: '🌐',
    title: 'Multilingual. Instant. Reliable.',
    description: 'English, Urdu, Roman Urdu — speak naturally. We understand all.',
  },
  {
    id: '4',
    icon: '🚀',
    title: 'Ready to Get Started?',
    description: 'Sign up now and experience the future of service booking. No more calling around — just type and go!',
  },
];

const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      hasCompletedOnboarding();
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    hasCompletedOnboarding();
    router.replace('/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        {!isLast && (
          <AnimatedButton title="Skip" onPress={handleSkip} variant="ghost" size="sm" />
        )}
      </View>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <Text style={styles.slideIcon}>{item.icon}</Text>
            </View>
            <GlassCard style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </GlassCard>
            {isLast && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => {
                    hasCompletedOnboarding();
                    router.replace('/login');
                  }}
                >
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => {
                    hasCompletedOnboarding();
                    router.replace('/signup');
                  }}
                >
                  <Text style={styles.signupButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
      {!isLast && (
        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
            ))}
          </View>
          <AnimatedButton title="Next" onPress={handleNext} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: { marginBottom: 40 },
  slideIcon: { fontSize: 80 },
  card: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    marginTop: 32,
    width: '100%',
    gap: 12,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signupButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  signupButtonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.accent,
    width: 24,
  },
});
