import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  id: string;
  color?: string;
  size?: number;
};

const SHORT_NAME: Record<string, string> = {
  leadership: 'Leadership',
  communication: 'Comms',
  feedback: 'Feedback',
  personality: 'Personality',
  innovation: 'Innovation',
  growth: 'Growth',
  shielding: 'Shielding',
};

export function worldShortName(id: string, fallback: string): string {
  return SHORT_NAME[id] ?? fallback;
}

/** Restrained geometric marks — no emoji, no cartoon faces. */
export function WorldIcon({ id, color = theme.colors.royal, size = 22 }: Props): React.JSX.Element {
  const inset = Math.max(5, Math.round(size * 0.26));

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
        },
      ]}
      accessibilityLabel={worldShortName(id, id)}
    >
      <Mark id={id} size={size - inset * 2} color={color} />
    </View>
  );
}

function Mark({ id, size, color }: { id: string; size: number; color: string }): React.JSX.Element {
  switch (id) {
    case 'leadership':
      return (
        <View
          style={{
            width: size * 0.7,
            height: size * 0.7,
            borderWidth: 2,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
            borderRadius: 2,
          }}
        />
      );
    case 'communication':
      return (
        <View
          style={{
            width: size * 0.78,
            height: size * 0.5,
            borderRadius: size,
            borderWidth: 2,
            borderColor: color,
          }}
        />
      );
    case 'feedback':
      return (
        <View
          style={{
            width: size * 0.58,
            height: size * 0.74,
            borderRadius: 3,
            borderWidth: 2,
            borderColor: color,
          }}
        />
      );
    case 'personality':
      return (
        <View
          style={{
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: size,
            borderWidth: 2,
            borderColor: color,
          }}
        />
      );
    case 'innovation':
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size * 0.34,
            borderRightWidth: size * 0.34,
            borderBottomWidth: size * 0.62,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
      );
    case 'growth':
      return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: size * 0.1, height: size }}>
          <View style={{ width: 3, height: size * 0.36, borderRadius: 1, backgroundColor: color }} />
          <View style={{ width: 3, height: size * 0.54, borderRadius: 1, backgroundColor: color }} />
          <View style={{ width: 3, height: size * 0.76, borderRadius: 1, backgroundColor: color }} />
        </View>
      );
    case 'shielding':
      return (
        <View
          style={{
            width: size * 0.62,
            height: size * 0.7,
            borderWidth: 2,
            borderColor: color,
            borderBottomLeftRadius: size,
            borderBottomRightRadius: size,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          }}
        />
      );
    default:
      return (
        <View
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: size,
            borderWidth: 2,
            borderColor: color,
          }}
        />
      );
  }
}

export function BrandMark({ size = 18 }: { size?: number }): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: theme.colors.lime,
        borderRadius: size * 0.2,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

export function OutlineHex({ color, size = 16 }: { color: string; size?: number }): React.JSX.Element {
  const inner = size * 0.62;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: inner,
          height: inner,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 3,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
