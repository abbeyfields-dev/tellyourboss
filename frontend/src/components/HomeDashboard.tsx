import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { latestCompleted, type AuthUser, type InboxItem, type SubjectSummary } from '../api/types';
import { formatScore } from '../data/score';
import { theme, type } from '../theme';
import { AvatarBubble } from './AvatarBubble';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  user: AuthUser;
  subjects: SubjectSummary[];
  inbox: InboxItem[];
  seenIds: string[];
  onRate: () => void;
  onOpenRated: (subject: SubjectSummary) => void;
  onAsk: () => void;
  onOpenFeedback: () => void;
  onOpenInboxItem: (id: string) => void;
  error?: string | null;
};

function formatToday(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());
}

export function HomeDashboard({
  user,
  subjects,
  inbox,
  seenIds,
  onRate,
  onOpenRated,
  onAsk,
  onOpenFeedback,
  onOpenInboxItem,
  error,
}: Props): React.JSX.Element {
  const firstName = user.displayName?.trim().split(' ')[0] || 'there';
  const given = subjects.filter((row) => latestCompleted(row)).length;
  const receivedScores = inbox.map((item) => item.overall).filter((score): score is number => score != null);
  const avgReceived = receivedScores.length
    ? formatScore(receivedScores.reduce((sum, score) => sum + score, 0) / receivedScores.length)
    : '—';
  const unread = inbox.filter((item) => !seenIds.includes(item.id)).length;
  const recent = subjects
    .filter((row) => latestCompleted(row))
    .sort((a, b) => {
      const left = latestCompleted(a)?.completedAt ?? '';
      const right = latestCompleted(b)?.completedAt ?? '';
      return right.localeCompare(left);
    })
    .slice(0, 8);
  const preview = inbox.slice(0, 2);

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <View style={styles.top}>
        <View>
          <Text style={styles.date}>{formatToday()}</Text>
          <Text style={styles.hello}>Hi, {firstName}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <Pressable
          onPress={onOpenFeedback}
          accessibilityRole="button"
          accessibilityLabel={`Feedback, ${unread} new`}
          style={styles.bell}
        >
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 9.2a6 6 0 0 1 12 0c0 4.2 1.2 5.6 1.2 5.6H4.8S6 13.4 6 9.2Z"
              stroke={theme.colors.ink}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Path d="M10 18.2a2 2 0 0 0 4 0" stroke={theme.colors.ink} strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroTitle}>Choose a colleague to rate</Text>
        <Text style={styles.heroCopy}>Select their profile to start your feedback.</Text>
        <PrimaryButton variant="onBrand" label="Start New Rating" onPress={onRate} />
        <Pressable onPress={onAsk} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.ask}>Ask someone to rate you</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{given}</Text>
          <Text style={styles.statLabel}>Given</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{inbox.length}</Text>
          <Text style={styles.statLabel}>Received</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{avgReceived}</Text>
          <Text style={styles.statLabel}>Avg received</Text>
        </View>
      </View>
      <Text style={styles.disclaimer}>Scores are feedback indicators, not measures of worth.</Text>

      <Text style={styles.section}>Recently rated</Text>
      {recent.length === 0 ? <Text style={styles.empty}>People you finish rating will show up here.</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {recent.map((row) => (
          <Pressable key={row.id} style={styles.chip} onPress={() => onOpenRated(row)} accessibilityRole="button">
            <AvatarBubble name={row.displayName} size={64} letters={2} />
            <Text style={styles.chipName} numberOfLines={1}>
              {row.displayName.split(' ')[0]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.section}>Feedback for you</Text>
      {preview.length === 0 ? <Text style={styles.empty}>Feedback sent to your email will show up here.</Text> : null}
      {preview.map((item) => {
        const fresh = !seenIds.includes(item.id);
        const who = item.senderLabel || 'Anonymous colleague';
        return (
          <Pressable key={item.id} style={styles.note} onPress={() => onOpenInboxItem(item.id)} accessibilityRole="button">
            <View style={styles.noteTop}>
              <Text style={styles.noteName}>{who}</Text>
              {fresh ? (
                <View style={styles.newPill}>
                  <Text style={styles.newText}>New</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.noteCopy}>{item.blurb || 'Open this to see the scorecard.'}</Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.seeAll} onPress={onOpenFeedback} accessibilityRole="button">
        <Text style={styles.seeAllText}>See all feedback</Text>
      </Pressable>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 28,
    gap: 16,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  hello: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  error: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 240,
  },
  bell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#E0912B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  disclaimer: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8,
  },
  note: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 6,
    ...theme.shadow.card,
  },
  noteTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  noteName: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  noteCopy: {
    ...type.sans,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  newPill: {
    backgroundColor: '#F8E7C8',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newText: {
    ...type.sans,
    color: '#9A6412',
    fontSize: 11,
    fontWeight: '800',
  },
  seeAll: {
    backgroundColor: theme.colors.brandSoft,
    borderRadius: theme.radius.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllText: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  hero: {
    backgroundColor: theme.colors.brand,
    borderRadius: theme.radius.xl,
    padding: 22,
    gap: 12,
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
  heroTitle: {
    ...type.verdict,
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 31,
  },
  heroCopy: {
    ...type.sans,
    color: theme.colors.onNavyMuted,
    fontSize: 15,
  },
  ask: {
    ...type.sans,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    ...theme.shadow.card,
  },
  statOn: {
    backgroundColor: theme.colors.brand,
    borderColor: theme.colors.brand,
  },
  statValue: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 24,
    lineHeight: 28,
  },
  statValueOn: {
    color: '#FFFFFF',
  },
  statLabel: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  statLabelOn: {
    color: '#FFFFFF',
  },
  empty: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadow.card,
  },
  continueCopy: {
    flex: 1,
    gap: 2,
  },
  continueLabel: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  pill: {
    alignSelf: 'center',
    flexShrink: 0,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillProgress: {
    backgroundColor: theme.colors.brand,
  },
  pillDone: {
    backgroundColor: theme.colors.brandSoft,
  },
  pillSent: {
    backgroundColor: '#E7F6EF',
  },
  pillText: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  pillTextOn: {
    color: '#FFFFFF',
  },
  pillTextDone: {
    color: theme.colors.accent,
  },
  pillTextSent: {
    color: theme.colors.success,
  },
  continueMeta: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  arrow: {
    color: theme.colors.textMuted,
    fontSize: 22,
  },
  section: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  allLink: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: 72,
    alignItems: 'center',
    gap: 6,
  },
  chipName: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...type.sans,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadow.card,
  },
  personMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
