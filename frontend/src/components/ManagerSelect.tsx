import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  latestCompleted,
  personStatus,
  resumableDraft,
  type PersonStatus,
  type SubjectSummary,
} from '../api/types';
import { formatScore } from '../data/score';
import { theme, type } from '../theme';
import { AvatarBubble } from './AvatarBubble';

type Filter = 'all' | 'completed' | 'drafts' | 'sent';

type Props = {
  subjects: SubjectSummary[];
  busy?: boolean;
  error?: string | null;
  onAddPerson: (input: { displayName: string }) => void;
  onStart: (subject: SubjectSummary) => void;
  onOpenProfile: (subject: SubjectSummary) => void;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'sent', label: 'Feedback Sent' },
];

const STATUS_LABEL: Record<PersonStatus, string> = {
  new: 'Not started',
  progress: 'Draft',
  completed: 'Completed',
  sent: 'Feedback sent',
};

function matches(filter: Filter, status: PersonStatus): boolean {
  if (filter === 'all') return true;
  if (filter === 'completed') return status === 'completed';
  if (filter === 'drafts') return status === 'progress';
  return status === 'sent';
}

export function ManagerSelect({
  subjects,
  busy = false,
  error,
  onAddPerson,
  onStart,
  onOpenProfile,
}: Props): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>('all');
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const alreadyExists = subjects.some((subject) => subject.displayName.trim().toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed.length > 0 && !alreadyExists;
  const visible = subjects.filter((subject) => matches(filter, personStatus(subject)));

  const add = () => {
    if (!canAdd) return;
    onAddPerson({ displayName: trimmed });
    setName('');
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Who are you rating?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((item) => {
          const selected = filter === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.filter, selected && styles.filterOn]}
            >
              <Text style={[styles.filterLabel, selected && styles.filterLabelOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.section}>Your people</Text>
      {visible.length === 0 ? (
        <Text style={styles.empty}>
          {filter === 'all' ? 'Add someone below to start a rating.' : 'No one in this group.'}
        </Text>
      ) : null}
      {visible.map((subject) => {
        const status = personStatus(subject);
        const completed = latestCompleted(subject);
        const draft = resumableDraft(subject);
        const detail = [subject.roleTitle, subject.company].filter(Boolean).join(' · ');
        const progress =
          status === 'progress' && draft
            ? `${draft.answeredCount ?? 0} answered`
            : completed && status !== 'progress'
              ? formatScore(completed.overall ?? 0)
              : null;
        return (
          <View key={subject.id} style={styles.card}>
            <Pressable
              style={styles.cardMain}
              onPress={() => onStart(subject)}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${subject.displayName}`}
            >
              <AvatarBubble name={subject.displayName} size={44} />
              <View style={styles.cardCopy}>
                <Text style={styles.cardName}>{subject.displayName}</Text>
                {detail ? <Text style={styles.cardMeta}>{detail}</Text> : null}
                {progress ? <Text style={styles.cardMeta}>{progress}</Text> : null}
              </View>
            </Pressable>
            <View style={styles.cardSide}>
              <View
                style={[
                  styles.pill,
                  status === 'progress' && styles.pillDraft,
                  status === 'completed' && styles.pillDone,
                  status === 'sent' && styles.pillSent,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    status === 'progress' && styles.pillTextDraft,
                    status === 'completed' && styles.pillTextDone,
                    status === 'sent' && styles.pillTextSent,
                  ]}
                >
                  {STATUS_LABEL[status]}
                </Text>
              </View>
              <Pressable
                onPress={() => onOpenProfile(subject)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${subject.displayName} profile`}
              >
                <Text style={styles.profileLink}>Profile</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Text style={styles.section}>Add someone new</Text>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={theme.colors.textDim}
          value={name}
          onChangeText={setName}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Pressable
          onPress={add}
          disabled={!canAdd || busy}
          accessibilityRole="button"
          style={[styles.addBtn, (!canAdd || busy) && styles.addBtnOff]}
        >
          <Text style={styles.addBtnText}>{busy ? '…' : 'Add'}</Text>
        </Pressable>
      </View>
      {alreadyExists ? <Text style={styles.hint}>{trimmed} is already on your list.</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 28,
    lineHeight: 34,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
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
  section: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  empty: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...theme.shadow.card,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  profileLink: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  cardSide: {
    alignItems: 'flex-end',
    gap: 8,
  },
  pill: {
    alignSelf: 'flex-end',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillDraft: {
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
  pillTextDraft: {
    color: '#FFFFFF',
  },
  pillTextDone: {
    color: theme.colors.accent,
  },
  pillTextSent: {
    color: theme.colors.success,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 15,
    minHeight: 52,
    fontSize: 16,
    color: theme.colors.ink,
  },
  addBtn: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnOff: {
    backgroundColor: theme.colors.softBlue,
  },
  addBtnText: {
    ...type.sans,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  error: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 13,
  },
});
