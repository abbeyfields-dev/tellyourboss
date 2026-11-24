import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { Dimension } from '../data/dimensions';
import { formatScore } from '../data/score';
import { theme, type } from '../theme';
import { FadeMount } from './FadeMount';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  dimension: Dimension;
  worldIndex: number;
  worldTotal: number;
  average: number;
  comment: string;
  nextDimension: Dimension | null;
  completedThrough: number;
  onContinue: () => void;
  onSelectSection: (worldIndex: number) => void;
  onReview: () => void;
  onSaveLater: () => void;
  userInitial?: string;
  onAvatarPress?: () => void;
};

const RING = 168;
const STROKE = 12;

function ScoreRing({ score, color }: { score: number; color: string }): React.JSX.Element {
  const radius = (RING - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0.04, Math.min(1, score / 5));
  const dash = circumference * progress;
  const center = RING / 2;
  return (
    <View style={styles.ringWrap}>
      <Svg width={RING} height={RING}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`${color}22`}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Text style={styles.score}>{formatScore(score)}</Text>
        <Text style={styles.outOf}>/ 5</Text>
      </View>
    </View>
  );
}

export function RecapPanel({
  dimension,
  worldIndex,
  worldTotal,
  average,
  comment,
  nextDimension,
  onContinue,
  onReview,
  onSaveLater,
}: Props): React.JSX.Element {
  const color = dimension.accent;

  return (
    <FadeMount>
      <View style={styles.wrap}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.tag, { backgroundColor: `${color}18` }]}>
            <Text style={[styles.tagText, { color }]}>
              Category {worldIndex + 1} of {worldTotal} complete
            </Text>
          </View>
          <Text style={styles.title}>{dimension.title}</Text>
          <ScoreRing score={average} color={color} />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <Text style={styles.cardCopy}>{comment}</Text>
          </View>
          <View style={styles.action}>
            <PrimaryButton
              variant="accent"
              label={nextDimension ? 'Next category' : 'See the scorecard'}
              onPress={onContinue}
            />
          </View>
          <Pressable onPress={onReview} accessibilityRole="button" hitSlop={8} style={styles.linkHit}>
            <Text style={styles.link}>Review this category</Text>
          </Pressable>
          <Pressable onPress={onSaveLater} accessibilityRole="button" hitSlop={8} style={styles.linkHit}>
            <Text style={styles.link}>Save for later</Text>
          </Pressable>
        </ScrollView>
      </View>
    </FadeMount>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
  },
  tag: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    ...type.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  ringLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  score: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 44,
    lineHeight: 48,
  },
  outOf: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginTop: -2,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#F3F5FB',
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  cardCopy: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  linkHit: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  link: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
