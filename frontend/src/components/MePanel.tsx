import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  user: AuthUser;
  onSave: (input: InsightInput) => Promise<void>;
  onLogout: () => void;
  onAsk: () => void;
};

export function MePanel({ user, onSave, onLogout, onAsk }: Props): React.JSX.Element {
  const [draft, setDraft] = useState<InsightDraft>(emptyInsight());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(insightDraftFromStored(user));
  }, [user]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>Your profile</Text>
      <Text style={styles.title}>About you</Text>
      <Text style={styles.lede}>
        A few details so ratings can turn into compatibility insights. Nothing here is shared.
      </Text>
      <ProfileFields draft={draft} onChange={setDraft} email={user.email} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.disclaimer}>{INSIGHTS_DISCLAIMER}</Text>
      <PrimaryButton variant="accent" label={busy ? 'Saving…' : 'Save'} onPress={() => void save()} disabled={busy} />
      <PrimaryButton variant="outline" label="Ask someone to rate you" onPress={onAsk} disabled={busy} />
      <PrimaryButton variant="ghost" label="Log out" onPress={onLogout} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 28,
    gap: 12,
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
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  lede: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  disclaimer: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 14,
  },
});
