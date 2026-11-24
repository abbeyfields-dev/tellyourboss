import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  latestCompleted,
  latestDraft,
  type AuthUser,
  type Relationship,
  type SubjectSummary,
} from '../api/types';
import { TAGLINE, TAGLINE_HOOK } from '../brand';
import { QUESTION_COUNT } from '../data/dimensions';
import { formatScore } from '../data/score';
import { theme } from '../theme';
import { ConfirmSheet } from './ConfirmSheet';
import { PrimaryButton } from './PrimaryButton';
import { StepProgress } from './StepProgress';

const RELATIONSHIPS: { id: Relationship; label: string }[] = [
  { id: 'BOSS', label: 'Boss' },
  { id: 'SKIP_LEVEL', label: 'Skip-level' },
  { id: 'PEER', label: 'Peer' },
  { id: 'REPORT', label: 'Report' },
  { id: 'STAKEHOLDER', label: 'Stakeholder' },
  { id: 'OTHER', label: 'Other' },
];

type Props = {
  user: AuthUser;
  subjects: SubjectSummary[];
  busy?: boolean;
  error?: string | null;
  onAddPerson: (input: { displayName: string; roleTitle?: string; relationship: Relationship }) => void;
  onStart: (subject: SubjectSummary) => void;
  onView: (subject: SubjectSummary) => void;
  onDeleteRating: (subject: SubjectSummary) => void;
  onDeletePerson: (subject: SubjectSummary) => void;
  onSignOut: () => void;
};

export function WelcomePanel({
  user,
  subjects,
  busy = false,
  error,
  onAddPerson,
  onStart,
  onView,
  onDeleteRating,
  onDeletePerson,
  onSignOut,
}: Props): React.JSX.Element {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('BOSS');
  const [menuSubject, setMenuSubject] = useState<SubjectSummary | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SubjectSummary | null>(null);
  const greeting = user.displayName?.trim() || user.email;

  const add = () => {
    const displayName = name.trim();
    if (!displayName) return;
    onAddPerson({
      displayName,
      roleTitle: role.trim() || undefined,
      relationship,
    });
    setName('');
    setRole('');
    setRelationship('BOSS');
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <View style={styles.userRow}>
        <View style={styles.userCopy}>
          <Text style={styles.signedIn}>
            Signed in as <Text style={styles.userName}>{greeting}</Text>
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <Pressable onPress={onSignOut} hitSlop={8}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <Text style={styles.headline}>Who are you rating?</Text>
      <Text style={styles.tagline}>{TAGLINE}</Text>
      <Text style={styles.insight}>{TAGLINE_HOOK}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add someone</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={theme.colors.textDim}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Role (optional)"
          placeholderTextColor={theme.colors.textDim}
          value={role}
          onChangeText={setRole}
        />
        <View style={styles.chips}>
          {RELATIONSHIPS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setRelationship(item.id)}
              style={[styles.chip, relationship === item.id && styles.chipOn]}
            >
              <Text style={[styles.chipLabel, relationship === item.id && styles.chipLabelOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton variant="accent" label={busy ? 'Saving…' : 'Add person'} onPress={add} disabled={busy} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Your people</Text>
      {subjects.length === 0 ? (
        <Text style={styles.empty}>No one yet. Add a person to start a rating.</Text>
      ) : (
        <View style={styles.list}>
          {subjects.map((subject) => {
            const completed = latestCompleted(subject);
            const draft = latestDraft(subject);
            const answered = draft?.answeredCount ?? (completed ? QUESTION_COUNT : 0);
            const rel = RELATIONSHIPS.find((item) => item.id === subject.relationship)?.label ?? subject.relationship;
            const primaryLabel = draft ? 'Continue rating' : completed ? 'View last rating' : 'Start rating';
            const primaryAction = draft || !completed ? () => onStart(subject) : () => onView(subject);
            return (
              <View key={subject.id} style={styles.person}>
                <Text style={styles.personName}>{subject.displayName}</Text>
                <Text style={styles.personMeta}>
                  {rel}
                  {subject.roleTitle ? ` · ${subject.roleTitle}` : ''}
                </Text>
                {draft || completed ? (
                  <>
                    <Text style={styles.progressLabel}>
                      {draft
                        ? `${answered} / ${QUESTION_COUNT} answered`
                        : `Last rating ${formatScore(completed?.overall ?? 0)} · ${completed?.archetype ?? 'Done'}`}
                    </Text>
                    <StepProgress
                      total={QUESTION_COUNT}
                      current={Math.max(0, answered - 1)}
                      color={draft ? theme.colors.limeDeep : theme.colors.ink}
                    />
                  </>
                ) : (
                  <Text style={styles.progressLabel}>Not started</Text>
                )}
                <View style={styles.personActions}>
                  <View style={styles.primaryWrap}>
                    <PrimaryButton variant="accent" label={primaryLabel} onPress={primaryAction} />
                  </View>
                  <Pressable
                    style={styles.moreBtn}
                    onPress={() => setMenuSubject(subject)}
                    accessibilityLabel={`More actions for ${subject.displayName}`}
                  >
                    <Text style={styles.moreMark}>···</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <ConfirmSheet
        visible={menuSubject != null}
        title={menuSubject?.displayName ?? 'More'}
        message="View a finished scorecard, start again, or remove this person."
        actions={[
          ...(menuSubject && latestCompleted(menuSubject)
            ? [
                {
                  label: 'View last rating',
                  primary: true,
                  onPress: () => {
                    const target = menuSubject;
                    setMenuSubject(null);
                    onView(target);
                  },
                },
                {
                  label: 'Rate again',
                  onPress: () => {
                    const target = menuSubject;
                    setMenuSubject(null);
                    onStart(target);
                  },
                },
              ]
            : []),
          ...(menuSubject
            ? [
                {
                  label: 'Delete…',
                  destructive: true,
                  onPress: () => {
                    setPendingDelete(menuSubject);
                    setMenuSubject(null);
                  },
                },
              ]
            : []),
        ]}
        onClose={() => setMenuSubject(null)}
      />
      <ConfirmSheet
        visible={pendingDelete != null}
        title={pendingDelete ? `Delete ${pendingDelete.displayName}?` : 'Delete'}
        message="Delete the last saved rating, or remove this person and every scorecard."
        actions={[
          ...(pendingDelete && (latestCompleted(pendingDelete) || latestDraft(pendingDelete))
            ? [
                {
                  label: latestCompleted(pendingDelete) ? 'Delete last rating' : 'Delete in-progress rating',
                  destructive: true,
                  onPress: () => {
                    const target = pendingDelete;
                    setPendingDelete(null);
                    onDeleteRating(target);
                  },
                },
              ]
            : []),
          ...(pendingDelete
            ? [
                {
                  label: 'Remove person',
                  destructive: true,
                  onPress: () => {
                    const target = pendingDelete;
                    setPendingDelete(null);
                    onDeletePerson(target);
                  },
                },
              ]
            : []),
        ]}
        onClose={() => setPendingDelete(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: theme.space.xl,
    gap: theme.space.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  userCopy: {
    flex: 1,
    gap: 2,
  },
  signedIn: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  userName: {
    color: theme.colors.ink,
    fontWeight: '800',
  },
  userEmail: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
  signOut: {
    color: theme.colors.ink,
    fontWeight: '700',
    fontSize: 14,
    paddingTop: 2,
  },
  headline: {
    color: theme.colors.ink,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  tagline: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: -4,
  },
  insight: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 27, 48, 0.08)',
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.ink,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipOn: {
    backgroundColor: theme.colors.lime,
    borderColor: theme.colors.lime,
  },
  chipLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelOn: {
    color: theme.colors.onLime,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  empty: {
    color: theme.colors.textDim,
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  person: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 27, 48, 0.08)',
    padding: 16,
    gap: 6,
  },
  personName: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  personMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  progressLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  personActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  primaryWrap: {
    flex: 1,
  },
  moreBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  moreMark: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: -4,
  },
});
