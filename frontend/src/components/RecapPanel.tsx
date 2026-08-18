import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Dimension } from '../data/dimensions';
import { formatScore } from '../data/score';
import { rankTitle, starCount, theme } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { StarRow } from './StarRow';
import { WorldIcon } from './WorldIcon';

type Props = {
  dimension: Dimension;
  worldIndex: number;
  worldTotal: number;
  average: number;
  nextDimension: Dimension | null;
  onContinue: () => void;
};

export function RecapPanel({
  dimension,
  worldIndex,
  worldTotal,
  average,
  nextDimension,
  onContinue,
}: Props): React.JSX.Element {
  const stars = starCount(average);

  return (
    <View style={styles.wrap}>
      <View style={[styles.banner, { backgroundColor: dimension.accent }]}>
        <Text style={styles.bannerLabel}>World {worldIndex + 1} cleared</Text>
        <Text style={styles.bannerRank}>{rankTitle(average)}</Text>
      </View>
      <View style={styles.body}>
        <WorldIcon id={dimension.id} color={dimension.accent} size={56} />
        <Text style={styles.title}>{dimension.title}</Text>
        <StarRow filled={stars} size={28} />
        <Text style={[styles.score, { color: dimension.accent }]}>{formatScore(average)}</Text>
        <Text style={styles.outOf}>out of 5 · {stars}-star clear</Text>
        <Text style={styles.blurb}>{dimension.blurb}</Text>
        {nextDimension ? (
          <View style={styles.next}>
            <Text style={styles.nextLabel}>
              Next world {worldIndex + 2} / {worldTotal}
            </Text>
            <View style={styles.nextTitleRow}>
              <WorldIcon id={nextDimension.id} color={nextDimension.accent} size={18} />
              <Text style={styles.nextTitle}>{nextDimension.title}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.nextLabel}>Final scorecard is next.</Text>
        )}
      </View>
      <PrimaryButton
        variant="accent"
        label={nextDimension ? 'Continue campaign' : 'See the scorecard'}
        onPress={onContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    gap: theme.space.md,
  },
  banner: {
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bannerRank: {
    color: theme.colors.onInk,
    fontSize: 20,
    fontWeight: '900',
  },
  body: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  score: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  outOf: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  blurb: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 4,
  },
  next: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 12,
    gap: 4,
  },
  nextLabel: {
    color: theme.colors.royal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  nextTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
