import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

interface OfflineBannerProps {
  visible: boolean;
}

// A flat, solid-color banner rather than a blurred/translucent one:
// blur views on some Android devices repaint poorly and can flash
// white for a frame, which is exactly the wrong look for a "you're
// offline" notice that should read as calm and immediate.
export function OfflineBanner({ visible }: OfflineBannerProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : -40, { duration: 220 });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.banner, { backgroundColor: theme.colors.warning }, animatedStyle]}
    >
      <Ionicons name="cloud-offline-outline" size={15} color="#1A1300" />
      <Text style={[styles.text, { fontFamily: theme.fontFamily.semiBold }]}>{t('home.offline')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  text: {
    color: '#1A1300',
    fontSize: 13,
  },
});
