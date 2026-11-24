import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { PrimaryButton } from './PrimaryButton';

export type ConfirmAction = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  primary?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  message: string;
  actions: ConfirmAction[];
  onClose: () => void;
  placement?: 'sheet' | 'dialog';
  cancelLabel?: string;
};

export function ConfirmSheet({
  visible,
  title,
  message,
  actions,
  onClose,
  placement = 'sheet',
  cancelLabel = 'Cancel',
}: Props): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, placement === 'dialog' && styles.overlayDialog]}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, placement === 'dialog' && styles.dialog]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {actions.map((action) => (
            <PrimaryButton
              key={action.label}
              variant={action.destructive ? 'danger' : action.primary ? 'accent' : 'ghost'}
              label={action.label}
              onPress={action.onPress}
            />
          ))}
          <PrimaryButton variant="ghost" label={cancelLabel} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    backgroundColor: theme.colors.bgElevated,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.xl,
    gap: theme.space.sm,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  overlayDialog: {
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
  },
  dialog: {
    borderRadius: theme.radius.lg,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
