import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { StepProgress } from './StepProgress';
import { WorldIcon } from './WorldIcon';

type Props = {
  badge: string;
  title: string;
  worldId?: string;
  accent?: string;
  total: number;
  current: number;
  backLabel: string;
  onBack: () => void;
};

export function GameHud({
  badge,
  title,
  worldId,
  accent = theme.colors.royal,
  total,
  current,
  backLabel,
  onBack,
}: Props): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <View style={styles.copy}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
          <View style={styles.titleRow}>
            {worldId ? <WorldIcon id={worldId} color={accent} size={18} /> : null}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.back}>{backLabel}</Text>
        </Pressable>
      </View>
      <StepProgress total={total} current={current} color={accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    marginBottom: theme.space.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: theme.colors.onInk,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  back: {
    color: theme.colors.ink,
    fontWeight: '700',
    fontSize: 13,
  },
});
