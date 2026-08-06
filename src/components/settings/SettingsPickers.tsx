import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ThemeMode, AppLanguage } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedPickerProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function SegmentedPicker<T extends string>({ options, value, onChange }: SegmentedPickerProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.background, borderRadius: theme.radius.md }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: selected ? theme.colors.onPrimary : theme.colors.textSecondary,
                  fontFamily: selected ? theme.fontFamily.semiBold : theme.fontFamily.medium,
                },
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface ThemePickerProps {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
  labels: { dark: string; light: string; system: string };
}

export function ThemePicker({ value, onChange, labels }: ThemePickerProps) {
  return (
    <SegmentedPicker
      value={value}
      onChange={onChange}
      options={[
        { value: 'dark', label: labels.dark },
        { value: 'light', label: labels.light },
        { value: 'system', label: labels.system },
      ]}
    />
  );
}

interface LanguagePickerProps {
  value: AppLanguage;
  onChange: (value: AppLanguage) => void;
  labels: { ar: string; en: string };
}

export function LanguagePicker({ value, onChange, labels }: LanguagePickerProps) {
  return (
    <SegmentedPicker
      value={value}
      onChange={onChange}
      options={[
        { value: 'ar', label: labels.ar },
        { value: 'en', label: labels.en },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
  },
});
