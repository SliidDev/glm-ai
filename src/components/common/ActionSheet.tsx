import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export interface ActionSheetItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionSheetItem[];
}

export function ActionSheet({ visible, onClose, title, actions }: ActionSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        onPress={onClose}
        accessibilityRole="button"
      >
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surfaceElevated,
              paddingBottom: insets.bottom + 12,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
          {title && (
            <Text
              style={[
                styles.title,
                { color: theme.colors.textMuted, fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.sm },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={action.destructive ? theme.colors.error : theme.colors.text}
                style={styles.rowIcon}
              />
              <Text
                style={[
                  styles.rowLabel,
                  {
                    color: action.destructive ? theme.colors.error : theme.colors.text,
                    fontFamily: theme.fontFamily.medium,
                    fontSize: theme.fontSize.base,
                  },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    textAlign: 'auto',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  rowIcon: {
    marginEnd: 14,
  },
  rowLabel: {
    textAlign: 'auto',
  },
});
