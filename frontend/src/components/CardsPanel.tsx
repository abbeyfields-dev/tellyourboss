import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { latestCompleted, resumableDraft, type AuthUser, type SubjectSummary } from '../api/types';
import { QUESTION_COUNT } from '../data/dimensions';
import { formatScore } from '../data/score';
import { theme, type } from '../theme';
import { AvatarBubble } from './AvatarBubble';
import { ConfirmSheet } from './ConfirmSheet';
import { StepProgress } from './StepProgress';

type Filter = 'all' | 'cards' | 'drafts';

type Props = {
  user: AuthUser;
  subjects: SubjectSummary[];
  onView: (subject: SubjectSummary) => void;
  onResume: (subject: SubjectSummary) => void;
  onNew: () => void;
  onDeleteRating: (subject: SubjectSummary) => void;
  onAccount: () => void;
};

export function CardsPanel({
  user,
  subjects,
  onView,
  onResume,
  onNew,
  onDeleteRating,
  onAccount,
}: Props): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>('all');
  const [pendingDelete, setPendingDelete] = useState<SubjectSummary | null>(null);
  const completedCount = subjects.filter((row) => latestCompleted(row)).length;

  const rows = subjects.flatMap((subject) => {
    const completed = latestCompleted(subject);
    const draft = resumableDraft(subject);
    if (!draft && !completed) return [];
    return [{ subject, draft, completed }];
  });

  const visible = rows.filter((row) => {
    if (filter === 'cards') return row.completed != null;
    if (filter === 'drafts') return row.draft != null;
    return true;
  });

  return (
    <>
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <View style={styles.top}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Scorecards</Text>
          <Text style={styles.copy}>{completedCount} finished · drafts stay here until you complete them.</Text>
        </View>
        <Pressable onPress={onAccount} accessibilityLabel="Account">
          <AvatarBubble name={user.displayName?.trim() || user.email} size={44} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Pressable onPress={onNew}>
          <Text style={styles.newBtnText}>+ New rating</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {([
          ['all', 'All'],
          ['cards', 'Complete'],
          ['drafts', 'Drafts'],
        ] as const).map(([id, label]) => (
          <Pressable key={id} onPress={() => setFilter(id)} style={[styles.filter, filter === id && styles.filterOn]}>
            <Text style={[styles.filterLabel, filter === id && styles.filterLabelOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {visible.length === 0 ? (
        <Text style={styles.empty}>Nothing here yet.</Text>
      ) : (
        visible.map(({ subject, draft, completed }) => {
          return (
            <View key={subject.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={completed ? `Open ${subject.displayName}` : `Resume ${subject.displayName}`}
                  onPress={() => (completed ? onView(subject) : onResume(subject))}
                  style={styles.cardMain}
                >
                  <AvatarBubble name={subject.displayName} size={44} />
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardName}>{subject.displayName}</Text>
                    <Text style={styles.cardMeta}>
                      {completed
                        ? `${formatScore(completed.overall ?? 0)} · ${completed.archetype ?? 'Rated'}`
                        : `${draft?.answeredCount ?? 0} / ${QUESTION_COUNT} questions`}
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.kind}>
                  <Text style={styles.kindText}>{completed ? 'Done' : 'Draft'}</Text>
                </View>
              </View>
              {draft && !completed ? (
                <StepProgress total={QUESTION_COUNT} current={Math.max(0, (draft.answeredCount ?? 1) - 1)} />
              ) : null}
              <View style={styles.actions}>
                {draft ? (
                  <Pressable accessibilityRole="button" onPress={() => onResume(subject)}>
                    <Text style={styles.primaryAction}>Resume</Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                <Pressable accessibilityRole="button" onPress={() => setPendingDelete(subject)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
    <ConfirmSheet
      visible={pendingDelete != null}
      placement="dialog"
      title={pendingDelete ? `Delete scores for ${pendingDelete.displayName}?` : 'Delete scores?'}
      message={
        pendingDelete
          ? `This deletes the scores for this rating. ${pendingDelete.displayName} stays on your list.`
          : 'This deletes the scores for this rating. The person stays on your list.'
      }
      cancelLabel="Keep scores"
      actions={[
        {
          label: 'Delete scores',
          destructive: true,
          onPress: () => {
            const target = pendingDelete;
            setPendingDelete(null);
            if (target) onDeleteRating(target);
          },
        },
      ]}
      onClose={() => setPendingDelete(null)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 28,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 28,
    lineHeight: 34,
  },
  copy: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  newBtnText: {
    ...type.sans,
    color: theme.colors.brand,
    fontSize: 15,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filter: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterOn: {
    backgroundColor: theme.colors.brand,
    borderColor: theme.colors.brand,
  },
  filterLabel: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterLabelOn: {
    color: '#FFFFFF',
  },
  empty: {
    ...type.sans,
    color: theme.colors.textDim,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 10,
    ...theme.shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    minWidth: 0,
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  cardMeta: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  kind: {
    backgroundColor: theme.colors.brandSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  kindText: {
    ...type.sans,
    color: theme.colors.brand,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryAction: {
    ...type.sans,
    color: theme.colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  remove: {
    ...type.sans,
    color: theme.colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
});
