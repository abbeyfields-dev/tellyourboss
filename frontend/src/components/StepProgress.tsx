import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  total: number;
  current: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

export function StepProgress({
  total,
  current,
  color = theme.colors.limeDeep,
  trackColor = theme.colors.border,
  height = 3,
}: Props): React.JSX.Element {
  const filled = Math.min(total, current + 1);
  const ratio = total === 0 ? 0 : filled / total;

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height }]} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
