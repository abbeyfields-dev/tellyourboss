import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { avatarColor, type } from '../theme';

type Props = {
  name: string;
  size?: number;
  letters?: 1 | 2;
};

function mark(name: string, letters: 1 | 2): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (letters === 1 || parts.length === 1) return parts[0].slice(0, letters).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AvatarBubble({ name, size = 44, letters = 1 }: Props): React.JSX.Element {
  const initial = mark(name, letters);
  const backgroundColor = avatarColor(name);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.4) }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    ...type.sans,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
