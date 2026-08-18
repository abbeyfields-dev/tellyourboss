import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'ghost';
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
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.label,
          variant === 'ghost' && styles.ghostLabel,
          variant === 'accent' && styles.accentLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: theme.radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: theme.colors.ink,
  },
  accent: {
    backgroundColor: theme.colors.royal,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 27, 48, 0.16)',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: theme.colors.onInk,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  accentLabel: {
    color: theme.colors.onInk,
  },
  ghostLabel: {
    color: theme.colors.ink,
  },
});
