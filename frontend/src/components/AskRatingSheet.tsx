import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { isValidEmail } from '../data/score';
import { theme, type } from '../theme';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
};

export function AskRatingSheet({ visible, onClose, onSend }: Props): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setEmail('');
    setError(null);
    setNotice(null);
    setBusy(false);
  }, [visible]);

  const send = async () => {
    if (!isValidEmail(email)) {
      setError('Enter the email address of the person you want to ask.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSend(email.trim());
      setNotice('Request sent. It is listed under Requested in Feedbacks. The email does not include your address.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <Text style={styles.title}>Ask someone to rate you</Text>
          {notice ? (
            <Text style={styles.notice}>{notice}</Text>
          ) : (
            <>
              <Text style={styles.copy}>
                We’ll email them a request to rate you in boss-o-rater. Your email address is not included.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Their email"
                placeholderTextColor={theme.colors.textDim}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton
                variant="accent"
                label={busy ? 'Sending…' : 'Send request'}
                onPress={() => void send()}
                disabled={busy}
              />
            </>
          )}
          <PrimaryButton variant="ghost" label="Close" onPress={onClose} disabled={busy} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 33, 61, 0.45)' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: 20,
    gap: 12,
  },
  title: { ...type.sans, fontSize: 20, lineHeight: 26, fontWeight: '700', color: theme.colors.ink },
  copy: { ...type.sans, fontSize: 14, lineHeight: 20, color: theme.colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...type.sans,
    fontSize: 16,
    color: theme.colors.ink,
  },
  notice: { ...type.sans, fontSize: 14, lineHeight: 20, color: theme.colors.success },
  error: { ...type.sans, fontSize: 14, lineHeight: 20, color: theme.colors.danger },
});
