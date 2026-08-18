import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatScore, type QuizResult } from '../data/score';
import { rankTitle, scoreColor, starCount, theme } from '../theme';
import { DimensionScoreRow } from './DimensionScoreRow';
import { PrimaryButton } from './PrimaryButton';
import { StarRow } from './StarRow';
import { WorldIcon } from './WorldIcon';

type Props = {
  result: QuizResult;
  shareHint: string | null;
  onShare: () => void;
  onRestart: () => void;
};

export function ResultsPanel({ result, shareHint, onShare, onRestart }: Props): React.JSX.Element {
  const color = scoreColor(result.overall);
  const stars = starCount(result.overall);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, { backgroundColor: color }]}>
          <Text style={styles.bannerLabel}>Campaign complete</Text>
          <Text style={styles.bannerRank}>{rankTitle(result.overall)}</Text>
          <StarRow filled={stars} size={22} invert />
        </View>
        <Text style={[styles.overall, { color }]}>{formatScore(result.overall)}</Text>
        <Text style={styles.outOf}>
          out of 5 across {result.answered} quests · {stars}-star run
        </Text>
        <Text style={styles.archetype}>{result.archetype}</Text>
        <Text style={styles.blurb}>{result.blurb}</Text>

        <View style={styles.callouts}>
          <View style={styles.callout}>
            <Text style={styles.calloutLabel}>Best world</Text>
            <View style={styles.calloutValueRow}>
              <WorldIcon id={result.strongest.dimension.id} color={result.strongest.dimension.accent} size={18} />
              <Text style={styles.calloutValue}>{formatScore(result.strongest.average)}</Text>
            </View>
            <Text style={styles.calloutName}>{result.strongest.dimension.title}</Text>
          </View>
          <View style={styles.callout}>
            <Text style={styles.calloutLabel}>Needs a retry</Text>
            <View style={styles.calloutValueRow}>
              <WorldIcon id={result.weakest.dimension.id} color={result.weakest.dimension.accent} size={18} />
              <Text style={styles.calloutValue}>{formatScore(result.weakest.average)}</Text>
            </View>
            <Text style={styles.calloutName}>{result.weakest.dimension.title}</Text>
          </View>
        </View>

        <View style={styles.rows}>
          {result.dimensions.map((row) => (
            <DimensionScoreRow key={row.dimension.id} row={row} />
          ))}
        </View>
        {shareHint ? <Text style={styles.shareHint}>{shareHint}</Text> : null}
      </ScrollView>
      <View style={styles.actions}>
        <PrimaryButton variant="accent" label="Share the scorecard" onPress={onShare} />
        <PrimaryButton variant="ghost" label="New campaign" onPress={onRestart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    gap: theme.space.md,
  },
  scroll: {
    paddingBottom: theme.space.sm,
    gap: 8,
  },
  banner: {
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bannerRank: {
    color: theme.colors.onInk,
    fontSize: 22,
    fontWeight: '900',
  },
  overall: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
  },
  outOf: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  archetype: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  blurb: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  callouts: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  callout: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 12,
    gap: 4,
  },
  calloutLabel: {
    color: theme.colors.royal,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  calloutValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calloutValue: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  calloutName: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  rows: {
    gap: 14,
    paddingTop: 8,
  },
  shareHint: {
    marginTop: 8,
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    gap: theme.space.sm,
  },
});
