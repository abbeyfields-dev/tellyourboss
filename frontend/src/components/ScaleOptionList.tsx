import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ScaleOption, ScaleValue } from '../data/dimensions';
import { theme, type } from '../theme';

type Props = {
  options: ScaleOption[];
  selected?: ScaleValue;
  onSelect: (value: ScaleValue) => void;
};

const SCALE_COLOR: Record<ScaleValue, string> = {
  5: theme.colors.scale5,
  4: theme.colors.scale4,
  3: theme.colors.scale3,
  2: theme.colors.scale2,
  1: theme.colors.scale1,
};

export function ScaleOptionList({ options, selected, onSelect }: Props): React.JSX.Element {
  const ordered = [...options].sort((a, b) => b.value - a.value);
  return (
    <View style={styles.list}>
      {ordered.map((item) => {
        const isSelected = selected === item.value;
        return (
          <Pressable
            key={item.value}
            style={({ pressed }) => [
              styles.row,
              isSelected && styles.rowSelected,
              pressed && styles.rowPressed,
            ]}
            onPress={() => onSelect(item.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <View style={[styles.num, { backgroundColor: SCALE_COLOR[item.value] }]}>
              <Text style={styles.numText}>{item.value}</Text>
            </View>
            <Text style={[styles.title, isSelected && styles.titleOn]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 14,
  },
  rowSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  rowPressed: {
    opacity: 0.92,
  },
  num: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    ...type.sans,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  title: {
    ...type.sans,
    flex: 1,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  titleOn: {
    color: '#FFFFFF',
  },
});
