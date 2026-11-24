import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TAGLINE_HOOK } from '../brand';
import { theme, type } from '../theme';
import { BrandLogo } from './BrandLogo';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  onDone: () => void;
};

export function WelcomeOnboarding({ onDone }: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.wrap}>
        <BrandLogo width={260} />
        <Text style={styles.title}>Rate the people you work with</Text>
        <Text style={styles.copy}>{TAGLINE_HOOK}</Text>
        <PrimaryButton variant="accent" label="Get started" onPress={onDone} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F4EF',
  },
  wrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  title: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  copy: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 8,
  },
});
