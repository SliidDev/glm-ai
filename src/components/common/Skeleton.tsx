import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SkeletonBlockProps {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

function SkeletonBlock({ width, height, radius = 8, style }: SkeletonBlockProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })),
      -1,
      false
    );
  }, [reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: reducedMotion ? 0.7 : opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.colors.surfaceElevated },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Placeholder row matching ChatListItem's layout, shown while the
 * chat list loads from storage on cold start. */
export function ChatListItemSkeleton() {
  return (
    <View style={styles.row}>
      <SkeletonBlock width={44} height={44} radius={22} />
      <View style={styles.rowText}>
        <SkeletonBlock width="60%" height={14} />
        <SkeletonBlock width="85%" height={12} style={styles.rowSubline} />
      </View>
    </View>
  );
}

export function ChatListSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <ChatListItemSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  rowSubline: {
    marginTop: 0,
  },
});
