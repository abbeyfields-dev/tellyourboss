import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { InboxItem, RatingRequestItem } from '../api/types';
import { OPINION_DISCLAIMER } from '../brand';
import { answersFromScorecard, buildResult, formatScore } from '../data/score';
import { theme, type } from '../theme';
import { DimensionScoreRow } from './DimensionScoreRow';
import { SpiderChart } from './SpiderChart';

type Section = 'received' | 'requested';

type Props = {
  items: InboxItem[];
  requests: RatingRequestItem[];
  seenIds: string[];
  focusId?: string | null;
  onOpen: (id: string) => void;
  onBackToList?: () => void;
};

function askedOn(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
}

export function FeedbackPanel({
  items,
  requests,
  seenIds,
  focusId,
  onOpen,
  onBackToList,
}: Props): React.JSX.Element {
  const [section, setSection] = useState<Section>('received');
  const [openId, setOpenId] = useState<string | null>(focusId ?? null);
  const selected = items.find((item) => item.id === openId) ?? null;

  useEffect(() => {
    if (focusId) setOpenId(focusId);
  }, [focusId]);

  const close = () => {
    setOpenId(null);
    onBackToList?.();
  };

  const open = (id: string) => {
    setOpenId(id);
    onOpen(id);
  };

  if (openId) {
    if (!selected) {
      return (
        <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
          <Pressable onPress={close} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.back}>‹ All feedback</Text>
          </Pressable>
          <Text style={styles.empty}>This rating is not available yet.</Text>
        </ScrollView>
      );
    }
    const result = buildResult(answersFromScorecard(selected.answers), selected.selectedDimensionIds);
    const who = selected.senderLabel || 'Anonymous colleague';
    return (
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Pressable onPress={close} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.back}>‹ All feedback</Text>
        </Pressable>
        <Text style={styles.kicker}>{selected.senderLabel ? `From ${who}` : 'Anonymous feedback'}</Text>
        <Text style={styles.title}>{who}</Text>
        <Text style={styles.score}>{formatScore(result.overall)} / 5</Text>
        <View style={styles.card}>
          <SpiderChart rows={result.dimensions} />
        </View>
        <View style={styles.card}>
          {result.dimensions.map((row) => (
            <DimensionScoreRow key={row.dimension.id} row={row} />
          ))}
        </View>
        {selected.blurb ? <Text style={styles.copy}>{selected.blurb}</Text> : null}
        <Text style={styles.fine}>{OPINION_DISCLAIMER}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Feedbacks</Text>
      <Text style={styles.lede}>
        {section === 'received'
          ? 'Ratings people sent you.'
          : 'People you asked to rate you. Their rating shows up here when they finish.'}
      </Text>
      <View style={styles.filters}>
        {(
          [
            ['received', `Received ${items.length}`],
            ['requested', `Requested ${requests.length}`],
          ] as const
        ).map(([id, label]) => {
          const selectedFilter = section === id;
          return (
            <Pressable
              key={id}
              onPress={() => setSection(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedFilter }}
              style={[styles.filter, selectedFilter && styles.filterOn]}
            >
              <Text style={[styles.filterLabel, selectedFilter && styles.filterLabelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {section === 'received' ? (
        items.length === 0 ? (
          <Text style={styles.empty}>Nothing has been sent to you yet.</Text>
        ) : (
          items.map((item) => {
            const fresh = !seenIds.includes(item.id);
            const who = item.senderLabel || 'Anonymous colleague';
            return (
              <Pressable key={item.id} style={styles.card} onPress={() => open(item.id)} accessibilityRole="button">
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{who}</Text>
                  {item.overall != null ? <Text style={styles.cardScore}>{formatScore(item.overall)}</Text> : null}
                  {fresh ? (
                    <View style={styles.newPill}>
                      <Text style={styles.newText}>New</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.copy}>{item.blurb || 'Open this to see the scorecard.'}</Text>
              </Pressable>
            );
          })
        )
      ) : requests.length === 0 ? (
        <Text style={styles.empty}>Ask someone to rate you, and the request shows up here.</Text>
      ) : (
        requests.map((request) => {
          const received = request.status === 'received' && request.feedbackId;
          const body = (
            <>
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{request.recipientEmail}</Text>
                <View style={[styles.statusPill, received ? styles.statusReceived : styles.statusWaiting]}>
                  <Text style={[styles.statusText, received ? styles.statusTextReceived : styles.statusTextWaiting]}>
                    {received ? 'Received' : 'Waiting'}
                  </Text>
                </View>
              </View>
              <Text style={styles.copy}>
                {received ? 'Open their rating.' : 'Waiting for their rating.'}
                {askedOn(request.createdAt) ? ` Asked ${askedOn(request.createdAt)}.` : ''}
              </Text>
            </>
          );
          if (!received || !request.feedbackId) {
            return (
              <View key={request.id} style={styles.card}>
                {body}
              </View>
            );
          }
          const feedbackId = request.feedbackId;
          return (
            <Pressable
              key={request.id}
              style={styles.card}
              onPress={() => open(feedbackId)}
              accessibilityRole="button"
            >
              {body}
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 28,
    gap: 12,
  },
  back: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  kicker: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 26,
    fontWeight: '800',
  },
  lede: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filter: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterOn: {
    backgroundColor: theme.colors.brand,
    borderColor: theme.colors.brand,
  },
  filterLabel: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  filterLabelOn: {
    color: '#FFFFFF',
  },
  empty: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  score: {
    ...type.verdict,
    color: theme.colors.brand,
    fontSize: 40,
    lineHeight: 44,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 8,
    ...theme.shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardName: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  cardScore: {
    ...type.sans,
    color: theme.colors.brand,
    fontSize: 16,
    fontWeight: '800',
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
  statusPill: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusWaiting: {
    backgroundColor: theme.colors.bg,
  },
  statusReceived: {
    backgroundColor: '#E7F6EF',
  },
  statusText: {
    ...type.sans,
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextWaiting: {
    color: theme.colors.textMuted,
  },
  statusTextReceived: {
    color: theme.colors.success,
  },
  copy: {
    ...type.sans,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  fine: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
