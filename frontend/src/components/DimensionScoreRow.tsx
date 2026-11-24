import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatScore, type DimensionScore } from '../data/score';
import { theme, type } from '../theme';

type Props = {
  row: DimensionScore;
  summary?: string;
  onPress?: () => void;
};

export function DimensionScoreRow({ row, summary, onPress }: Props): React.JSX.Element {
  const width = `${Math.max(4, Math.min(100, (row.average / 5) * 100))}%` as const;
  const body = (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.title}>{row.dimension.title}</Text>
        <Text style={styles.score}>{formatScore(row.average)}/5</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: row.dimension.accent }]} />
      </View>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open the first ${row.dimension.title} question`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  pressed: {
    opacity: 0.72,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    ...type.sans,
    flex: 1,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  score: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 9,
    backgroundColor: theme.colors.brandSoft,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 9,
  },
  summary: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
