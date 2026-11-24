import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatScore } from '../data/score';
import { theme } from '../theme';

type Props = {
  completed: number;
  lastOverall: number | null;
  lastArchetype: string | null;
};

export function QuizStats({ completed, lastOverall, lastArchetype }: Props): React.JSX.Element {
  return (
    <View style={styles.row}>
      <View style={styles.chip}>
        <Text style={styles.label}>Ratings</Text>
        <Text style={styles.value}>{completed}</Text>
      </View>
      <View style={[styles.chip, styles.chipWide]}>
        <Text style={styles.label}>Last rank</Text>
        <Text style={styles.last} numberOfLines={2}>
          {lastOverall == null
            ? 'No ratings yet — start the first one.'
            : `${formatScore(lastOverall)} · ${lastArchetype ?? 'Rated'}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.space.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.space.sm,
  },
  chipWide: {
    flex: 1.6,
  },
  label: {
    color: theme.colors.royal,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    marginTop: 4,
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  last: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
