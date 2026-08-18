import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatScore, type DimensionScore } from '../data/score';
import { scoreColor, starCount, theme } from '../theme';
import { StarRow } from './StarRow';
import { WorldIcon } from './WorldIcon';

type Props = {
  row: DimensionScore;
};

export function DimensionScoreRow({ row }: Props): React.JSX.Element {
  const fill = Math.max(0, Math.min(1, row.average / 5));
  const color = scoreColor(row.average);

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <WorldIcon id={row.dimension.id} color={row.dimension.accent} size={16} />
          <Text style={styles.title} numberOfLines={1}>
            {row.dimension.title}
          </Text>
        </View>
        <Text style={[styles.score, { color }]}>{formatScore(row.average)}</Text>
      </View>
      <StarRow filled={starCount(row.average)} size={12} />
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fill * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  score: {
    fontSize: 15,
    fontWeight: '800',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(20, 27, 48, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
