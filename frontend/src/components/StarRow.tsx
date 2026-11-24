import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  filled: number;
  total?: number;
  size?: number;
  invert?: boolean;
  accent?: boolean;
};

export function StarRow({
  filled,
  total = 5,
  size = 16,
  invert = false,
  accent = false,
}: Props): React.JSX.Element {
  const on = invert ? '#FFFFFF' : accent ? theme.colors.limeDeep : theme.colors.gold;
  const off = invert ? 'rgba(255,255,255,0.32)' : 'rgba(16, 24, 43, 0.16)';

  return (
    <View style={styles.row} accessibilityLabel={`${filled} of ${total} stars`}>
      {Array.from({ length: total }, (_, index) => (
        <Text
          key={index}
          style={[
            styles.star,
            { fontSize: size, lineHeight: Math.round(size * 1.25), color: index < filled ? on : off },
          ]}
        >
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
    overflow: 'visible',
  },
  star: {
    fontWeight: '700',
    includeFontPadding: false,
  },
});
