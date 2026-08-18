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

/** Geometric world marks — no emoji fonts, so they cannot tofu. */
export function WorldIcon({ id, color = theme.colors.royal, size = 22 }: Props): React.JSX.Element {
  const inset = Math.max(4, Math.round(size * 0.22));

  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size * 0.34, backgroundColor: color },
      ]}
      accessibilityLabel={worldShortName(id, id)}
    >
      <Mark id={id} size={size - inset * 2} />
    </View>
  );
}

function Mark({ id, size }: { id: string; size: number }): React.JSX.Element {
  switch (id) {
    case 'leadership':
      return (
        <View
          style={{
            width: size * 0.72,
            height: size * 0.72,
            backgroundColor: theme.colors.onInk,
            transform: [{ rotate: '45deg' }],
            borderRadius: 2,
          }}
        />
      );
    case 'communication':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center' }}>
          <View
            style={{
              width: size * 0.78,
              height: size * 0.48,
              borderRadius: size,
              backgroundColor: theme.colors.onInk,
              alignSelf: 'center',
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size * 0.18,
              bottom: size * 0.08,
              width: 0,
              height: 0,
              borderTopWidth: size * 0.22,
              borderTopColor: theme.colors.onInk,
              borderLeftWidth: size * 0.18,
              borderLeftColor: 'transparent',
            }}
          />
        </View>
      );
    case 'feedback':
      return (
        <View
          style={{
            width: size * 0.62,
            height: size * 0.78,
            borderRadius: 3,
            backgroundColor: theme.colors.onInk,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              marginTop: -size * 0.08,
              width: size * 0.34,
              height: size * 0.14,
              borderRadius: 2,
              backgroundColor: theme.colors.onInk,
              borderWidth: 1.5,
              borderColor: 'transparent',
            }}
          />
        </View>
      );
    case 'personality':
      return (
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.42,
              height: size * 0.42,
              borderRadius: size,
              backgroundColor: theme.colors.onInk,
            }}
          />
          <View
            style={{
              marginTop: size * 0.06,
              width: size * 0.72,
              height: size * 0.28,
              borderTopLeftRadius: size,
              borderTopRightRadius: size,
              backgroundColor: theme.colors.onInk,
            }}
          />
        </View>
      );
    case 'innovation':
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size * 0.38,
            borderRightWidth: size * 0.38,
            borderBottomWidth: size * 0.72,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: theme.colors.onInk,
          }}
        />
      );
    case 'growth':
      return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: size * 0.1, height: size }}>
          <View style={{ width: size * 0.22, height: size * 0.38, borderRadius: 2, backgroundColor: theme.colors.onInk }} />
          <View style={{ width: size * 0.22, height: size * 0.58, borderRadius: 2, backgroundColor: theme.colors.onInk }} />
          <View style={{ width: size * 0.22, height: size * 0.82, borderRadius: 2, backgroundColor: theme.colors.onInk }} />
        </View>
      );
    case 'shielding':
      return (
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.7,
              height: size * 0.5,
              backgroundColor: theme.colors.onInk,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            }}
          />
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: size * 0.35,
              borderRightWidth: size * 0.35,
              borderTopWidth: size * 0.32,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: theme.colors.onInk,
            }}
          />
        </View>
      );
    default:
      return (
        <View
          style={{
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: size,
            backgroundColor: theme.colors.onInk,
          }}
        />
      );
  }
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
