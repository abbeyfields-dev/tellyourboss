import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { OPINION_DISCLAIMER } from '../brand';
import { BrandLogo } from '../components/BrandLogo';
import { DimensionScoreRow } from '../components/DimensionScoreRow';
import { SpiderChart } from '../components/SpiderChart';
import { PrimaryButton } from '../components/PrimaryButton';
import { answersFromScorecard, buildResult, formatScore } from '../data/score';
import { isValidEmail } from '../data/score';
import { theme, type } from '../theme';

type Props = {
  token: string;
};

type Details = {
  subjectName: string;
  senderLabel: string | null;
  selectedDimensionIds: string[];
  answers: { parameterId: string; value: number }[];
};

export function FeedbackScreen({ token }: Props): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [viewToken, setViewToken] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replyNotice, setReplyNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestCode = async () => {
    if (!isValidEmail(email)) {
      setError('Enter the email address this feedback was sent to.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await api.feedbackCode(token, email.trim());
      setCodeSent(true);
      setDevCode(result.devCode ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a code.');
    } finally {
      setBusy(false);
    }
  };

  const unlock = async () => {
    setBusy(true);
    setError(null);
    try {
      const verified = await api.feedbackVerify(token, code.trim());
      setViewToken(verified.viewToken);
      const next = await api.feedbackDetails(token, verified.viewToken);
      setDetails(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open this feedback.');
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!viewToken) return;
    const message = reply.trim();
    if (message.length < 2) {
      setError('Write a short reply first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.feedbackReply(token, viewToken, message);
      setReply('');
      setReplyNotice('Reply sent. Your email address was not included.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reply.');
    } finally {
      setBusy(false);
    }
  };

  const result = details
    ? buildResult(answersFromScorecard(details.answers), details.selectedDimensionIds)
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <BrandLogo width={200} />
        {result && details ? (
          <>
            <Text style={styles.kicker}>{details.senderLabel ? `From ${details.senderLabel}` : 'Anonymous feedback'}</Text>
            <Text style={styles.title}>{details.subjectName}</Text>
            <Text style={styles.score}>{formatScore(result.overall)} / 5</Text>
            <View style={styles.card}>
              <SpiderChart rows={result.dimensions} />
            </View>
            <View style={styles.card}>
              {result.dimensions.map((row) => (
                <DimensionScoreRow key={row.dimension.id} row={row} />
              ))}
            </View>
            <Text style={styles.blurb}>{result.blurb}</Text>
            <Text style={styles.fine}>{OPINION_DISCLAIMER}</Text>
            {details.senderLabel ? null : (
              <View style={styles.card}>
                <Text style={styles.replyTitle}>Reply without sharing your email</Text>
                <Text style={styles.copy}>
                  This goes to the person who sent the feedback. Neither email address is included.
                </Text>
                <TextInput
                  style={[styles.input, styles.replyInput]}
                  placeholder="Your reply"
                  placeholderTextColor={theme.colors.textDim}
                  multiline
                  value={reply}
                  onChangeText={setReply}
                />
                {replyNotice ? <Text style={styles.replyNotice}>{replyNotice}</Text> : null}
                <PrimaryButton variant="accent" label={busy ? 'Sending…' : 'Send reply'} onPress={() => void sendReply()} disabled={busy} />
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.title}>Your feedback is ready</Text>
            <Text style={styles.copy}>
              This link only opens for the email it was sent to. We’ll send a code to that inbox before showing the details.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {codeSent ? (
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                placeholderTextColor={theme.colors.textDim}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
            ) : null}
            {devCode ? <Text style={styles.notice}>Development code: {devCode}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {codeSent ? (
              <PrimaryButton variant="accent" label={busy ? 'Checking…' : 'Open feedback'} onPress={() => void unlock()} disabled={busy} />
            ) : (
              <PrimaryButton variant="accent" label={busy ? 'Sending…' : 'Email me a code'} onPress={() => void requestCode()} disabled={busy} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  wrap: {
    padding: 24,
    gap: 14,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
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
    fontSize: 15,
    lineHeight: 22,
  },
  score: {
    ...type.verdict,
    color: theme.colors.brand,
    fontSize: 48,
    lineHeight: 52,
  },
  blurb: {
    ...type.sans,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 14,
    ...theme.shadow.card,
  },
  fine: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  replyTitle: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  replyInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  replyNotice: {
    ...type.sans,
    color: theme.colors.success,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    minHeight: 52,
    fontSize: 16,
    color: theme.colors.ink,
  },
  notice: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 13,
  },
  error: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
