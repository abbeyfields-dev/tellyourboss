import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  total: number;
  current: number;
};

export function StageDots({ total, current }: Props): React.JSX.Element {
  return (
    <View style={styles.row} accessibilityLabel={`Category ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              done && styles.done,
              active && styles.active,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 24, 43, 0.14)',
  },
  done: {
    backgroundColor: theme.colors.limeDeep,
  },
  active: {
    width: 16,
    backgroundColor: theme.colors.ink,
  },
});
