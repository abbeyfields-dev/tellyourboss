import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { brandLogo } from '../brand';
import { DIMENSIONS, QUESTION_COUNT } from '../data/dimensions';
import { theme } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { QuizStats } from './QuizStats';
import { WorldIcon, worldShortName } from './WorldIcon';

type Props = {
  completed: number;
  lastOverall: number | null;
  lastArchetype: string | null;
  onStart: () => void;
};

export function WelcomePanel({
  completed,
  lastOverall,
  lastArchetype,
  onStart,
}: Props): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <View style={styles.logoCard}>
        <Image source={brandLogo} style={styles.logo} resizeMode="contain" accessibilityLabel="Boss-Rater" />
      </View>
      <View style={styles.mission}>
        <Text style={styles.eyebrow}>
          {DIMENSIONS.length} worlds · {QUESTION_COUNT} quests
        </Text>
        <Text style={styles.headline}>Rate your boss.{'\n'}Unlock the scorecard.</Text>
        <Text style={styles.insight}>
          Clear seven worlds — leadership, comms, feedback, vibes, risk, growth, and politics. Honest
          taps only. XP stays on this phone.
        </Text>
      </View>
      <View style={styles.worlds}>
        {DIMENSIONS.map((dimension, index) => (
          <View key={dimension.id} style={styles.worldChip}>
            <View style={[styles.worldPip, { backgroundColor: dimension.accent }]}>
              <Text style={styles.worldNum}>{index + 1}</Text>
            </View>
            <WorldIcon id={dimension.id} color={dimension.accent} size={28} />
            <Text style={styles.worldName} numberOfLines={1}>
              {worldShortName(dimension.id, dimension.title)}
            </Text>
          </View>
        ))}
      </View>
      <QuizStats completed={completed} lastOverall={lastOverall} lastArchetype={lastArchetype} />
      <PrimaryButton variant="accent" label="Start campaign" onPress={onStart} />
      <Text style={styles.footnote}>About five minutes. No account. No HR packet.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: theme.space.md,
    gap: theme.space.md,
  },
  logoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    paddingVertical: 8,
  },
  logo: {
    width: '88%',
    height: 88,
  },
  mission: {
    gap: 8,
  },
  eyebrow: {
    color: theme.colors.royal,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headline: {
    color: theme.colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  insight: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  worlds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  worldChip: {
    width: '31%',
    flexGrow: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  worldPip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldNum: {
    color: theme.colors.onInk,
    fontSize: 11,
    fontWeight: '800',
  },
  worldName: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  footnote: {
    color: theme.colors.textDim,
    fontSize: 13,
    textAlign: 'center',
  },
});
