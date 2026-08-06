import React from 'react';
import { View, Text, Pressable, Switch, StyleSheet, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.semiBold }]}>
        {title}
      </Text>
      <View style={[styles.sectionBody, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg }]}>
        {children}
      </View>
    </View>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
  isLast?: boolean;
}

export function SettingsRow({ icon, label, subtitle, value, onPress, toggleValue, onToggle, destructive, isLast }: SettingsRowProps) {
  const theme = useTheme();
  const isSwitch = typeof toggleValue === 'boolean';

  const content = (
    <View style={[styles.row, !isLast && { borderBottomColor: theme.colors.borderSubtle, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.iconWrap, { backgroundColor: destructive ? theme.colors.errorSoft : theme.colors.primarySoft }]}>
        <Ionicons name={icon} size={16} color={destructive ? theme.colors.error : theme.colors.primary} />
      </View>
      <View style={styles.textColumn}>
        <Text
          style={[
            styles.label,
            { color: destructive ? theme.colors.error : theme.colors.text, fontFamily: theme.fontFamily.medium },
          ]}
        >
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {isSwitch ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : value !== undefined ? (
        <Text style={[styles.value, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]} numberOfLines={1}>
          {value}
        </Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={styles.chevron} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginHorizontal: 20,
    textAlign: 'auto',
  },
  sectionBody: {
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    textAlign: 'auto',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
    textAlign: 'auto',
  },
  value: {
    fontSize: 13,
    maxWidth: 120,
  },
  chevron: {
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
});
