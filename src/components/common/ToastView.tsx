import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../context/ToastContext';

const ICONS = {
  default: 'information-circle' as const,
  success: 'checkmark-circle' as const,
  error: 'alert-circle' as const,
};

export function ToastView() {
  const { toast } = useToast();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!toast) return;
    translateY.value = 20;
    opacity.value = 0;
    translateY.value = withTiming(0, { duration: 180 });
    opacity.value = withSequence(withTiming(1, { duration: 180 }), withTiming(1, { duration: 1600 }), withTiming(0, { duration: 220 }));
  }, [toast?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  const color = toast.variant === 'error' ? theme.colors.error : toast.variant === 'success' ? theme.colors.success : theme.colors.primary;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { bottom: insets.bottom + 78, backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
        animatedStyle,
      ]}
    >
      <Ionicons name={ICONS[toast.variant]} size={17} color={color} />
      <Text
        style={[styles.text, { color: theme.colors.text, fontFamily: theme.fontFamily.medium }]}
        numberOfLines={2}
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '86%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    fontSize: 13,
    textAlign: 'auto',
  },
});
