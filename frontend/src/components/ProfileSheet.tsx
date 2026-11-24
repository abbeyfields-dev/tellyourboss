import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { SubjectSummary } from '../api/types';
import {
  INSIGHTS_DISCLAIMER,
  emptyInsight,
  insightDraftFromStored,
  insightInputFromDraft,
  type InsightDraft,
  type InsightInput,
} from '../data/profile';
import { theme, type } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { ProfileFields } from './ProfileFields';

type Props = {
  subject: SubjectSummary | null;
  busy?: boolean;
  onClose: () => void;
  onSave: (input: InsightInput) => Promise<void>;
  onDelete: () => void;
  sent?: boolean;
};

export function ProfileSheet({ subject, busy = false, onClose, onSave, onDelete, sent = false }: Props): React.JSX.Element {
  const [draft, setDraft] = useState<InsightDraft>(emptyInsight());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const who = subject?.displayName ?? 'This person';

  useEffect(() => {
    setConfirmingDelete(false);
  }, [subject?.id]);

  useEffect(() => {
    if (!subject) return;
    setDraft(insightDraftFromStored(subject));
    setError(null);
  }, [subject]);

  const save = async () => {
    const input = insightInputFromDraft(draft);
    if (!input.displayName) {
      setError('Add a name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={subject != null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>Their profile</Text>
            <Text style={styles.title}>{subject?.displayName ?? 'About this person'}</Text>
            <Text style={styles.lede}>
              Optional details for compatibility insights. They are not included in the email you send.
            </Text>
            <ProfileFields draft={draft} onChange={setDraft} audience="them" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.disclaimer}>{INSIGHTS_DISCLAIMER}</Text>
            <View style={styles.actions}>
              {confirmingDelete ? (
                <>
                  <Text style={styles.warning}>
                    This removes {who} from your list, along with their ratings and any feedback you sent.
                  </Text>
                  <PrimaryButton variant="danger" label="Delete this person" onPress={onDelete} disabled={saving || busy} />
                  <Pressable onPress={() => setConfirmingDelete(false)} disabled={saving || busy} accessibilityRole="button">
                    <Text style={styles.keepLink}>Keep this person</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <PrimaryButton
                    variant="accent"
                    label={saving ? 'Saving…' : 'Save'}
                    onPress={() => void save()}
                    disabled={saving || busy}
                  />
                  {sent ? (
                    <Text style={styles.locked}>This rating was sent, so this person can’t be removed.</Text>
                  ) : (
                    <Pressable
                      onPress={() => setConfirmingDelete(true)}
                      disabled={saving || busy}
                      accessibilityRole="button"
                      style={styles.deleteHit}
                    >
                      <Text style={styles.deleteLink}>Delete this person</Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: theme.colors.bgElevated,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.xl,
  },
  kicker: {
    ...type.sans,
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 28,
    lineHeight: 32,
  },
  lede: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  disclaimer: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 16,
  },
  error: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  warning: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  deleteHit: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  locked: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  deleteLink: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  keepLink: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
  },
  actions: {
    gap: 8,
    marginTop: 16,
  },
});
