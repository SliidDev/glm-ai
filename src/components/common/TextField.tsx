import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  errorText?: string;
}

export function TextField({ label, errorText, style, ...inputProps }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.sm },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: errorText ? theme.colors.error : theme.colors.border,
            color: theme.colors.text,
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.base,
            borderRadius: theme.radius.md,
          },
          style,
        ]}
        {...inputProps}
      />
      {errorText && (
        <Text
          style={[styles.error, { color: theme.colors.error, fontFamily: theme.fontFamily.regular }]}
          accessibilityLiveRegion="polite"
        >
          {errorText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    textAlign: 'auto',
  },
  input: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    textAlign: 'auto',
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'auto',
  },
});
