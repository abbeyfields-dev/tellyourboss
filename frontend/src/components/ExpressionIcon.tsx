import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type Mood = 1 | 2 | 3 | 4 | 5;

type Props = {
  mood: Mood;
  size?: number;
  color?: string;
};

export function ExpressionIcon({ mood, size = 28, color = theme.colors.accent }: Props): React.JSX.Element {
  const eye = Math.max(2, size * 0.08);
  const mouthW = size * 0.36;

  return (
    <View
      style={[
        styles.face,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
      ]}
      accessibilityLabel={`Level ${mood}`}
    >
      <View style={styles.eyes}>
        <View style={[styles.eye, { width: eye, height: eye, borderRadius: eye, backgroundColor: color }]} />
        <View style={[styles.eye, { width: eye, height: eye, borderRadius: eye, backgroundColor: color }]} />
      </View>
      {mood === 3 ? (
        <View style={[styles.flat, { width: mouthW, backgroundColor: color }]} />
      ) : (
        <View
          style={[
            styles.mouth,
            {
              width: mouthW,
              height: size * 0.16,
              borderColor: color,
              borderTopWidth: mood <= 2 ? 1.6 : 0,
              borderBottomWidth: mood >= 4 ? 1.6 : 0,
              transform: [{ scaleY: mood === 1 || mood === 5 ? 1.15 : 0.85 }],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  eyes: {
    flexDirection: 'row',
    gap: 5,
  },
  eye: {},
  flat: {
    height: 1.6,
    borderRadius: 1,
    marginTop: 2,
  },
  mouth: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderRadius: 8,
    marginTop: 1,
  },
});
