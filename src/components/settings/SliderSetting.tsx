import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../hooks/useTheme';

interface SliderSettingProps {
  label: string;
  hint?: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  displayValue: string;
  onValueChange: (value: number) => void;
}

export function SliderSetting({ label, hint, value, minimumValue, maximumValue, step, displayValue, onValueChange }: SliderSettingProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.fontFamily.medium }]}>{label}</Text>
        <View style={[styles.valuePill, { backgroundColor: theme.colors.primarySoft }]}>
          <Text style={[styles.valueText, { color: theme.colors.primary, fontFamily: theme.fontFamily.semiBold }]}>
            {displayValue}
          </Text>
        </View>
      </View>
      <Slider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary}
        accessibilityLabel={label}
        accessibilityValue={{ text: displayValue }}
      />
      {hint && (
        <Text style={[styles.hint, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    textAlign: 'auto',
  },
  valuePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  valueText: {
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    textAlign: 'auto',
  },
});
