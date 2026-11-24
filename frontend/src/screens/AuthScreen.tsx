import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import type { AuthPayload } from '../api/types';
import { isValidEmail } from '../data/score';
import { theme, type } from '../theme';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

type Props = {
  onAuthenticated: (payload: AuthPayload) => void;
};

function resetTokenFromLocation(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return '';
  return new URLSearchParams(window.location.search).get('reset') ?? '';
}

export function AuthScreen({ onAuthenticated }: Props): React.JSX.Element {
  const initialToken = resetTokenFromLocation();
  const [mode, setMode] = useState<Mode>(initialToken ? 'reset' : 'login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(initialToken);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState<'name' | 'email' | 'password' | 'token' | null>(null);

  const submit = async () => {
    setError(null);
    setNotice(null);
    if ((mode === 'login' || mode === 'register' || mode === 'forgot') && !isValidEmail(email)) {
      setError('Enter a valid email address. Any inbox is fine — it doesn’t have to be a work address.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'forgot') {
        const result = await api.forgotPassword(email);
        setNotice(
          result.devResetUrl
            ? `Email isn’t configured in this environment. Use this reset link: ${result.devResetUrl}`
            : 'If an account exists for that email, we sent reset instructions.',
        );
        return;
      }
      if (mode === 'reset') {
        await api.resetPassword(token, password);
        setPassword('');
        setToken('');
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location && window.history) {
          const url = new URL(window.location.href);
          url.searchParams.delete('reset');
          window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        }
        setMode('login');
        setNotice('Password updated. Log in with the new one.');
        return;
      }
      const payload =
        mode === 'register'
          ? await api.register(email, password, displayName.trim() || undefined)
          : await api.login(email, password);
      onAuthenticated(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  const headline =
    mode === 'register'
      ? 'Create your account'
      : mode === 'forgot'
        ? 'Reset your password'
        : mode === 'reset'
          ? 'Choose a new password'
          : 'Welcome back';

  return (
    <ScrollView
      contentContainerStyle={[styles.wrap, Platform.OS === 'web' && styles.wrapWeb]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <BrandLogo width={210} />
      <Text style={styles.headline}>{headline}</Text>
      {mode === 'register' ? (
        <View style={[styles.field, focused === 'name' && styles.fieldOn]}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textDim}
            autoCapitalize="words"
            value={displayName}
            onChangeText={setDisplayName}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused((current) => (current === 'name' ? null : current))}
          />
        </View>
      ) : null}
      {mode !== 'reset' ? (
        <>
          <View style={[styles.field, focused === 'email' && styles.fieldOn]}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused((current) => (current === 'email' ? null : current))}
            />
          </View>
          <Text style={styles.hint}>Use any email. We only check that it looks like an email address.</Text>
        </>
      ) : initialToken ? null : (
        <View style={[styles.field, focused === 'token' && styles.fieldOn]}>
          <TextInput
            style={styles.input}
            placeholder="Reset code from your email"
            placeholderTextColor={theme.colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            value={token}
            onChangeText={setToken}
            onFocus={() => setFocused('token')}
            onBlur={() => setFocused((current) => (current === 'token' ? null : current))}
          />
        </View>
      )}
      {mode !== 'forgot' ? (
        <View style={[styles.field, focused === 'password' && styles.fieldOn]}>
          <TextInput
            style={styles.input}
            placeholder={mode === 'login' ? 'Password' : 'Password (8+ characters)'}
            placeholderTextColor={theme.colors.textDim}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused((current) => (current === 'password' ? null : current))}
          />
        </View>
      ) : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        variant="accent"
        label={
          busy
            ? 'Working…'
            : mode === 'register'
              ? 'Create account'
              : mode === 'forgot'
                ? 'Send reset link'
                : mode === 'reset'
                  ? 'Update password'
                  : 'Log in'
        }
        onPress={() => {
          void submit();
        }}
        disabled={busy}
      />
      {mode === 'login' ? (
        <PrimaryButton
          variant="ghost"
          label="Forgot password"
          onPress={() => {
            setError(null);
            setNotice(null);
            setMode('forgot');
          }}
        />
      ) : null}
      <PrimaryButton
        variant="outline"
        label={mode === 'register' ? 'I already have an account' : 'Create an account'}
        onPress={() => {
          setError(null);
          setNotice(null);
          setMode(mode === 'register' ? 'login' : 'register');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    gap: 14,
    paddingVertical: 8,
  },
  wrapWeb: {
    flexGrow: 0,
    paddingBottom: 160,
    paddingHorizontal: 4,
  },
  headline: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 4,
  },
  hint: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -6,
  },
  field: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
  },
  fieldOn: {
    borderColor: theme.colors.accent,
  },
  input: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: theme.radius.md,
    paddingHorizontal: 15,
    paddingVertical: 14,
    minHeight: 52,
    fontSize: 16,
    color: theme.colors.ink,
  },
  notice: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
