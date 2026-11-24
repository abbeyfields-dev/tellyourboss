import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { APP_NAME, OPINION_DISCLAIMER } from '../brand';
import { formatScore, isValidEmail, type QuizResult, type ShareChannel } from '../data/score';
import { theme, type } from '../theme';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  result: QuizResult;
  subjectName?: string | null;
  busy?: boolean;
  onClose: () => void;
  onSend: (payload: { to: string; channel: ShareChannel }) => void;
};

export function ShareScorecardSheet({
  visible,
  result,
  subjectName,
  busy = false,
  onClose,
  onSend,
}: Props): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [channel, setChannel] = useState<ShareChannel>('anonymous');
  const [error, setError] = useState<string | null>(null);
  const who = subjectName?.trim() || 'Colleague';

  const shareOut = async (target: 'native' | 'facebook' | 'linkedin') => {
    const page =
      Platform.OS === 'web' && typeof window !== 'undefined' && window.location
        ? window.location.origin
        : 'https://bossorater.com';
    const text = `${who} on boss-o-rater`;
    if (target === 'native' && Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: text, text, url: page });
      } catch {
        // The share sheet was dismissed.
      }
      return;
    }
    if (target === 'native') {
      await Linking.openURL(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(page)}`);
      return;
    }
    const url =
      target === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(page)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(page)}`;
    await Linking.openURL(url);
  };

  useEffect(() => {
    if (!visible) return;
    setEmail('');
    setChannel('anonymous');
    setError(null);
  }, [visible]);

  const submit = () => {
    const next = email.trim();
    if (!isValidEmail(next)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    onSend({ to: next, channel });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetInner}
          >
            <Text style={styles.headline}>Share this scorecard</Text>
            <Text style={styles.copy}>
              The message, subject, and summary are written by {APP_NAME}. A secure link opens the detail only for the person you send it to.
            </Text>
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardBrand}>{APP_NAME}</Text>
                <Text style={styles.cardScore}>{formatScore(result.overall)}</Text>
              </View>
              <Text style={styles.cardWho}>{who}</Text>
              <Text style={styles.cardBlurb}>{result.blurb}</Text>
              <View style={styles.rows}>
                {result.dimensions.map((row) => (
                  <View key={row.dimension.id} style={styles.row}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {row.dimension.title}
                    </Text>
                    <Text style={styles.rowScore}>{formatScore(row.average)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cardFine}>{OPINION_DISCLAIMER}</Text>
            </View>
            <Text style={styles.socialNote}>
              Share this page, or screenshot the card for Instagram. Facebook and LinkedIn open a post with the boss-o-rater link.
            </Text>
            <View style={styles.channels}>
              <Pressable onPress={() => void shareOut('native')} style={styles.channel}>
                <Text style={styles.channelTitle}>Share</Text>
                <Text style={styles.channelHint}>Uses the share menu on this device when it is available.</Text>
              </Pressable>
              <Pressable onPress={() => void shareOut('facebook')} style={styles.channel}>
                <Text style={styles.channelTitle}>Facebook</Text>
                <Text style={styles.channelHint}>Opens Facebook with a link to boss-o-rater.</Text>
              </Pressable>
              <Pressable onPress={() => void shareOut('linkedin')} style={styles.channel}>
                <Text style={styles.channelTitle}>LinkedIn</Text>
                <Text style={styles.channelHint}>Opens LinkedIn with a link to boss-o-rater.</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Their email"
              placeholderTextColor={theme.colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError(null);
              }}
            />
            <View style={styles.channels}>
              <Pressable
                onPress={() => setChannel('anonymous')}
                style={[styles.channel, channel === 'anonymous' && styles.channelOn]}
              >
                <Text style={styles.channelTitle}>Anonymous</Text>
                <Text style={styles.channelHint}>
                  {APP_NAME} sends the email. Your name and email address are not included.
                </Text>
              </Pressable>
              <Pressable onPress={() => setChannel('self')} style={[styles.channel, channel === 'self' && styles.channelOn]}>
                <Text style={styles.channelTitle}>Identified</Text>
                <Text style={styles.channelHint}>Opens your mail app with the same system-written message.</Text>
              </Pressable>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              variant="accent"
              label={busy ? 'Working…' : channel === 'anonymous' ? 'Send anonymously' : 'Open mail app'}
              onPress={submit}
              disabled={busy}
            />
            <PrimaryButton variant="ghost" label="Cancel" onPress={onClose} disabled={busy} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '92%',
    backgroundColor: theme.colors.bgElevated,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  sheetInner: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.xl,
    gap: theme.space.sm,
  },
  headline: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 22,
    lineHeight: 28,
  },
  copy: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.colors.brand,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBrand: {
    ...type.sans,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
  },
  cardScore: {
    ...type.verdict,
    color: '#94B4F1',
    fontSize: 42,
    lineHeight: 46,
  },
  cardWho: {
    ...type.verdict,
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
  },
  cardBlurb: {
    ...type.sans,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    lineHeight: 20,
  },
  rows: {
    gap: 6,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowTitle: {
    ...type.sans,
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  rowScore: {
    ...type.sans,
    color: '#94B4F1',
    fontSize: 14,
    fontWeight: '800',
  },
  cardFine: {
    ...type.sans,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  socialNote: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.ink,
  },
  channels: {
    gap: 8,
  },
  channel: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  channelOn: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(196, 98, 26, 0.1)',
  },
  channelTitle: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  channelHint: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
