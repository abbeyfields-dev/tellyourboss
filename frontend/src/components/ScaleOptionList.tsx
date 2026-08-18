import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ScaleOption, ScaleValue } from '../data/dimensions';
import { theme } from '../theme';
import { StarRow } from './StarRow';

type Props = {
  options: ScaleOption[];
  selected?: ScaleValue;
  onSelect: (value: ScaleValue) => void;
};

const RANK_COLORS: Record<ScaleValue, string> = {
  1: theme.colors.coral,
  2: theme.colors.tangerine,
  3: theme.colors.gold,
  4: theme.colors.teal,
  5: theme.colors.royal,
};

export function ScaleOptionList({ options, selected, onSelect }: Props): React.JSX.Element {
  return (
    <FlatList
      style={styles.flex}
      data={options}
      keyExtractor={(item) => String(item.value)}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isSelected = selected === item.value;
        const color = RANK_COLORS[item.value];
        return (
          <Pressable
            style={({ pressed }) => [
              styles.row,
              isSelected && [styles.rowSelected, { borderColor: color }],
              pressed && styles.rowPressed,
            ]}
            onPress={() => onSelect(item.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{item.value}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.label}</Text>
              <StarRow filled={item.value} size={13} />
            </View>
            {isSelected ? <Text style={[styles.check, { color }]}>✓</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    paddingBottom: theme.space.lg,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowSelected: {
    backgroundColor: theme.colors.royalSoft,
  },
  rowPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.onInk,
    fontWeight: '900',
    fontSize: 16,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  check: {
    fontSize: 18,
    fontWeight: '900',
  },
});
