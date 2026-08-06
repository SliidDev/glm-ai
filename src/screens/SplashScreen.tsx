import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Logo } from '../components/common/Logo';
import { APP_NAME } from '../constants/config';

const MIN_DISPLAY_MS = 1100;

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(reducedMotion ? 1 : 0.82);
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const textOpacity = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.back(1.2)) });
    opacity.value = withTiming(1, { duration: 420 });
    textOpacity.value = withDelay(180, withTiming(1, { duration: 420 }));

    const timer = setTimeout(onFinished, MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
    // onFinished is a stable navigation callback from the caller —
    // re-running this effect on identity churn would restart the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={logoStyle}>
        <Logo size={96} pulsing />
      </Animated.View>
      <Animated.Text
        style={[styles.appName, textStyle, { color: theme.colors.text, fontFamily: theme.fontFamily.extraBold }]}
      >
        {APP_NAME}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    marginTop: 20,
    fontSize: 24,
    letterSpacing: 0.5,
  },
});
