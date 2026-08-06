import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle, GestureResponderEvent, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label?: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'start' | 'end';
  /** Set for directional glyphs (arrows, chevrons) whose meaning
   * depends on reading direction — mirrors the icon in RTL so
   * "forward"/"back" still point the right way. Icons with no
   * inherent direction (star, trash, copy...) should leave this off. */
  flipIconForRTL?: boolean;
  /** Renders as a circular icon-only button (no label) — replaces a
   * separate IconButton component since the styling logic is
   * otherwise identical. */
  iconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  flipIconForRTL = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.errorSoft
        : variant === 'secondary'
          ? theme.colors.surfaceElevated
          : 'transparent';

  const fg =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'danger'
        ? theme.colors.error
        : theme.colors.text;

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 19;
  const paddingV = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const paddingH = iconOnly ? paddingV : size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? theme.fontSize.sm : size === 'lg' ? theme.fontSize.md : theme.fontSize.base;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      hitSlop={iconOnly ? 8 : undefined}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          borderRadius: iconOnly ? 999 : theme.radius.md,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <>
          {icon && iconPosition === 'start' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={fg}
              style={[
                label && !iconOnly ? styles.iconStart : undefined,
                flipIconForRTL && I18nManager.isRTL ? styles.flipped : undefined,
              ]}
            />
          )}
          {!iconOnly && label && (
            <Text
              style={[styles.label, { color: fg, fontSize, fontFamily: theme.fontFamily.semiBold }]}
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
          {icon && iconPosition === 'end' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={fg}
              style={[
                label && !iconOnly ? styles.iconEnd : undefined,
                flipIconForRTL && I18nManager.isRTL ? styles.flipped : undefined,
              ]}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  iconStart: {
    marginEnd: 8,
  },
  iconEnd: {
    marginStart: 8,
  },
  flipped: {
    transform: [{ scaleX: -1 }],
  },
});
