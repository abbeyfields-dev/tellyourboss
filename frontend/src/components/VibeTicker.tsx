import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const MESSAGES = [
  'No HR CC. Just the truth.',
  '7 worlds. 35 quests. One scorecard.',
  'Rate the 11 PM “quick call” energy.',
  'Could their meeting have been an email?',
  'Unlock the Rare Pokémon Boss.',
];

export function VibeTicker(): React.JSX.Element {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.wrap} accessibilityRole="text">
      <View style={styles.brandChip}>
        <Text style={styles.brand}>BR</Text>
      </View>
      <Text style={styles.message} numberOfLines={1}>
        {MESSAGES[index]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: theme.space.md,
    paddingVertical: 12,
    backgroundColor: theme.colors.ink,
  },
  brandChip: {
    backgroundColor: theme.colors.royal,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  brand: {
    color: theme.colors.onInk,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  message: {
    flex: 1,
    color: theme.colors.onNavy,
    fontSize: 13,
    fontWeight: '600',
  },
});
