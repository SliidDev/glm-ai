import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useHaptics } from '../hooks/useHaptics';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  subtitleKey: string;
  isFirst?: boolean;
}

const SLIDES: Slide[] = [
  { icon: 'sparkles', titleKey: 'onboarding.slide1Title', subtitleKey: 'onboarding.slide1Subtitle', isFirst: true },
  { icon: 'albums-outline', titleKey: 'onboarding.slide2Title', subtitleKey: 'onboarding.slide2Subtitle' },
  { icon: 'options-outline', titleKey: 'onboarding.slide3Title', subtitleKey: 'onboarding.slide3Subtitle' },
  { icon: 'lock-closed-outline', titleKey: 'onboarding.slide4Title', subtitleKey: 'onboarding.slide4Subtitle' },
];

interface OnboardingScreenProps {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const goToIndex = (next: number) => {
    haptics.selection();
    // Horizontal ScrollView lays its children out with flexDirection:
    // 'row' under the hood, which — like every row layout in this app
    // — follows I18nManager automatically: in RTL the first slide
    // renders on the right and a forward swipe moves right-to-left,
    // matching the reading direction with no manual transform needed.
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {SLIDES.map((slide) => (
          <View key={slide.titleKey} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primarySoft }]}>
              {slide.isFirst ? <Logo size={56} /> : <Ionicons name={slide.icon} size={40} color={theme.colors.primary} />}
            </View>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily.extraBold }]}>
              {t(slide.titleKey)}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.regular }]}>
              {t(slide.subtitleKey)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <OnboardingDot key={slide.titleKey} active={i === index} activeColor={theme.colors.primary} inactiveColor={theme.colors.border} />
          ))}
        </View>

        <View style={styles.buttonsRow}>
          {!isLast ? (
            <>
              <Button label={t('onboarding.skip')} variant="ghost" onPress={onDone} />
              <Button label={t('onboarding.next')} icon="arrow-forward" iconPosition="end" flipIconForRTL onPress={() => goToIndex(index + 1)} />
            </>
          ) : (
            <Button label={t('onboarding.getStarted')} onPress={onDone} style={styles.fullWidthButton} />
          )}
        </View>
      </View>
    </View>
  );
}

function OnboardingDot({ active, activeColor, inactiveColor }: { active: boolean; activeColor: string; inactiveColor: string }) {
  const width = useSharedValue(active ? 20 : 7);
  useEffect(() => {
    width.value = withTiming(active ? 20 : 7, { duration: 220 });
  }, [active, width]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: active ? activeColor : inactiveColor,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 22,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullWidthButton: {
    flex: 1,
  },
});
