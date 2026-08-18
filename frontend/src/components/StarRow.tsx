import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  filled: number;
  total?: number;
  size?: number;
  invert?: boolean;
};

export function StarRow({ filled, total = 5, size = 16, invert = false }: Props): React.JSX.Element {
  const on = invert ? '#FFFFFF' : theme.colors.gold;
  const off = invert ? 'rgba(255,255,255,0.35)' : 'rgba(20, 27, 48, 0.18)';

  return (
    <View style={styles.row} accessibilityLabel={`${filled} of ${total} stars`}>
      {Array.from({ length: total }, (_, index) => (
        <Text key={index} style={[styles.star, { fontSize: size, color: index < filled ? on : off }]}>
          {index < filled ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    fontWeight: '700',
    lineHeight: 20,
  },
});
