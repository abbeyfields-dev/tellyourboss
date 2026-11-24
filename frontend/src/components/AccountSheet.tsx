import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AuthUser } from '../api/types';
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
  visible: boolean;
  user: AuthUser | null;
  onClose: () => void;
  onLogout: () => void;
  onSave: (input: InsightInput) => Promise<void>;
};

export function AccountSheet({ visible, user, onClose, onLogout, onSave }: Props): React.JSX.Element {
  const [draft, setDraft] = useState<InsightDraft>(emptyInsight());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDraft(insightDraftFromStored(user ?? {}));
    setError(null);
  }, [user, visible]);

  const save = async () => {
    const input = insightInputFromDraft(draft);
    if (!input.displayName) {
      setError('Add a name.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>Your profile</Text>
            <Text style={styles.title}>About you</Text>
            <Text style={styles.lede}>
              A few details so ratings can turn into compatibility insights. Nothing here is shared.
            </Text>
            <ProfileFields draft={draft} onChange={setDraft} email={user?.email} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.disclaimer}>{INSIGHTS_DISCLAIMER}</Text>
            <View style={styles.actions}>
              <PrimaryButton variant="accent" label={busy ? 'Saving…' : 'Save'} onPress={() => void save()} disabled={busy} />
              <PrimaryButton variant="outline" label="Skip for now" onPress={onClose} disabled={busy} />
              <PrimaryButton variant="ghost" label="Log out" onPress={onLogout} disabled={busy} />
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
  actions: {
    gap: 8,
    marginTop: 16,
  },
});
