import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OPINION_DISCLAIMER } from '../brand';
import { formatScore, type Answers, type QuizResult, type ShareChannel } from '../data/score';
import { theme, type } from '../theme';
import { AvatarBubble } from './AvatarBubble';
import { ConfirmSheet } from './ConfirmSheet';
import { DimensionScoreRow } from './DimensionScoreRow';
import { PrimaryButton } from './PrimaryButton';
import { ShareScorecardSheet } from './ShareScorecardSheet';
import { SpiderChart } from './SpiderChart';

function completedLabel(value?: string | null): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return 'Completed';
  const label = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
  return `Completed ${label}`;
}

type Props = {
  result: QuizResult;
  answers?: Answers;
  subjectName?: string | null;
  subjectRole?: string | null;
  completedAt?: string | null;
  shareHint: string | null;
  shareOpen: boolean;
  shareBusy?: boolean;
  onShare: () => void;
  onCloseShare: () => void;
  onSendEmail: (payload: { to: string; channel: ShareChannel }) => void;
  onRestart: () => void;
  onRateAgain?: () => void;
  onDelete?: () => void;
  saved?: boolean;
  userInitial?: string;
  onAvatarPress?: () => void;
  onOpenCategory?: (dimensionId: string) => void;
  locked?: boolean;
};

export function ResultsPanel({
  result,
  subjectName,
  subjectRole,
  completedAt,
  shareHint,
  shareOpen,
  shareBusy,
  onShare,
  onCloseShare,
  onSendEmail,
  onRestart,
  onRateAgain,
  onDelete,
  saved = false,
  onOpenCategory,
  locked = false,
}: Props): React.JSX.Element {
  const [confirm, setConfirm] = useState<null | 'rate' | 'delete'>(null);
  const who = subjectName ?? 'This person';
  const ranked = [...result.dimensions].sort((a, b) => b.average - a.average);
  const strengths = ranked.slice(0, 2);
  const opportunities = [...ranked].reverse().slice(0, 2);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Pressable onPress={onRestart} accessibilityRole="button">
            <Text style={styles.close}>Close</Text>
          </Pressable>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{completedLabel(completedAt)}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          {subjectName ? <AvatarBubble name={subjectName} size={70} letters={2} /> : null}
          {subjectName ? <Text style={styles.who}>{subjectName}</Text> : null}
          {subjectRole ? <Text style={styles.role}>{subjectRole}</Text> : null}
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{formatScore(result.overall)}</Text>
            <Text style={styles.outOf}> / 5</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SpiderChart rows={result.dimensions} />
        </View>

        <View style={styles.card}>
          {result.dimensions.map((row) => (
            <DimensionScoreRow
              key={row.dimension.id}
              row={row}
              onPress={!locked && onOpenCategory ? () => onOpenCategory(row.dimension.id) : undefined}
            />
          ))}
        </View>

        <View style={[styles.card, styles.strength]}>
          <Text style={styles.cardTitle}>Key strengths</Text>
          <Text style={styles.cardCopy}>
            {strengths.map((row) => `${row.dimension.title} (${formatScore(row.average)})`).join(' and ')}
          </Text>
        </View>
        <View style={[styles.card, styles.opportunity]}>
          <Text style={styles.cardTitle}>Opportunities</Text>
          <Text style={styles.cardCopy}>
            {opportunities.map((row) => `${row.dimension.title} (${formatScore(row.average)})`).join(' and ')}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balanced summary</Text>
          <Text style={styles.cardCopy}>{result.blurb}</Text>
        </View>

        <Text style={styles.disclaimer}>{OPINION_DISCLAIMER}</Text>
        {shareHint ? <Text style={styles.shareHint}>{shareHint}</Text> : null}
        <View style={styles.actions}>
          {locked ? <Text style={styles.locked}>This rating was sent, so the scores can no longer be changed.</Text> : null}
          <PrimaryButton variant="accent" label="Share this scorecard" onPress={onShare} />
          {saved && onRateAgain && !locked ? (
            <Pressable onPress={() => setConfirm('rate')} accessibilityRole="button" style={styles.linkHit}>
              <Text style={styles.rateLink}>Rate again</Text>
            </Pressable>
          ) : null}
          {saved && onDelete && !locked ? (
            <Pressable onPress={() => setConfirm('delete')} accessibilityRole="button" style={styles.linkHit}>
              <Text style={styles.deleteLink}>Delete this rating</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
      <ConfirmSheet
        visible={confirm != null}
        placement="dialog"
        title={confirm === 'rate' ? 'Rate again?' : 'Delete this rating?'}
        message={
          confirm === 'rate'
            ? `The last rating and its scores will be deleted. ${who} stays on your list.`
            : `This deletes the scores for this rating. ${who} stays on your list.`
        }
        cancelLabel="Keep this rating"
        onClose={() => setConfirm(null)}
        actions={[
          confirm === 'rate'
            ? {
                label: 'Rate again',
                primary: true,
                onPress: () => {
                  setConfirm(null);
                  onRateAgain?.();
                },
              }
            : {
                label: 'Delete this rating',
                destructive: true,
                onPress: () => {
                  setConfirm(null);
                  onDelete?.();
                },
              },
        ]}
      />
      <ShareScorecardSheet
        visible={shareOpen}
        result={result}
        subjectName={subjectName}
        busy={shareBusy}
        onClose={onCloseShare}
        onSend={onSendEmail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    gap: 12,
  },
  scroll: {
    paddingBottom: 12,
    gap: 14,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  tag: {
    backgroundColor: theme.colors.brandSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: theme.colors.brand,
    borderRadius: theme.radius.xl,
    padding: 22,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.brandGlow,
    top: -40,
    right: -20,
  },
  who: {
    ...type.sans,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  role: {
    ...type.sans,
    color: theme.colors.onNavyMuted,
    fontSize: 15,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  score: {
    ...type.verdict,
    color: '#FFFFFF',
    fontSize: 52,
    lineHeight: 56,
  },
  outOf: {
    ...type.sans,
    color: theme.colors.onNavyMuted,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  disclaimer: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 14,
    ...theme.shadow.card,
  },
  strength: {
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.success,
  },
  opportunity: {
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.scale1,
  },
  cardTitle: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  cardCopy: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  locked: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  shareHint: {
    ...type.sans,
    color: theme.colors.brand,
    fontSize: 13,
  },
  actions: {
    gap: 8,
  },
  linkHit: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  rateLink: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  deleteLink: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
