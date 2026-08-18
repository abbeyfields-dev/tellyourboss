import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  total: number;
  current: number;
  color?: string;
};

export function StepProgress({
  total,
  current,
  color = theme.colors.royal,
}: Props): React.JSX.Element {
  const filled = Math.min(total, current + 1);
  const ratio = total === 0 ? 0 : filled / total;

  return (
    <View style={styles.wrap} accessibilityRole="progressbar">
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.xp}>
        {filled} / {total} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(20, 27, 48, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  xp: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    minWidth: 58,
    textAlign: 'right',
  },
});
