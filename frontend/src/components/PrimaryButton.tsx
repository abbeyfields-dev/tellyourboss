import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme, type } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'danger' | 'onBrand' | 'outline';
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: Props): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.primary,
        variant === 'accent' && styles.accent,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        variant === 'onBrand' && styles.onBrand,
        disabled && variant !== 'accent' && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.label,
          (variant === 'accent' || variant === 'primary') && styles.accentLabel,
          variant === 'outline' && styles.outlineLabel,
          variant === 'ghost' && styles.ghostLabel,
          variant === 'danger' && styles.dangerLabel,
          variant === 'onBrand' && styles.onBrandLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.brand,
  },
  accent: {
    backgroundColor: theme.colors.accent,
  },
  outline: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  onBrand: {
    backgroundColor: '#FFFFFF',
  },
  disabled: {
    opacity: 0.38,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  label: {
    ...type.sans,
    color: theme.colors.ink,
    fontWeight: '700',
    fontSize: 16,
  },
  accentLabel: {
    color: theme.colors.onLime,
  },
  outlineLabel: {
    color: theme.colors.ink,
  },
  ghostLabel: {
    color: theme.colors.textMuted,
  },
  dangerLabel: {
    color: theme.colors.danger,
  },
  onBrandLabel: {
    color: theme.colors.brand,
  },
  disabledLabel: {
    color: theme.colors.onLime,
  },
});
