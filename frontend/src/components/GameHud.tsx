import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme, type } from '../theme';
import { StepProgress } from './StepProgress';

type Props = {
  title: string;
  subjectName?: string | null;
  current: number;
  total: number;
  stageCurrent: number;
  stageTotal?: number;
  questionIndex: number;
  questionTotal: number;
  onClose?: () => void;
  onHome?: () => void;
};

export function GameHud({
  title,
  current: _current,
  total: _total,
  stageCurrent,
  stageTotal = 7,
  questionIndex,
  questionTotal,
  onClose,
  onHome,
  subjectName,
}: Props): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.who} numberOfLines={1}>
          {subjectName || 'Rating'}
        </Text>
        <Pressable onPress={onHome ?? onClose} hitSlop={10} accessibilityRole="button">
          <View style={styles.exit}>
            <Text style={styles.exitText}>Save & exit</Text>
          </View>
        </Pressable>
      </View>
      <Text style={styles.meta}>
        Category {stageCurrent + 1} of {stageTotal} · {title}
      </Text>
      <StepProgress
        total={questionTotal}
        current={questionIndex}
        color={theme.colors.accent}
        trackColor={theme.colors.brandSoft}
        height={6}
      />
      <Text style={styles.count}>
        Question {questionIndex + 1} of {questionTotal}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 28,
  },
  who: {
    ...type.sans,
    flex: 1,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  exit: {
    backgroundColor: theme.colors.brandSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  exitText: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    ...type.sans,
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  count: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});
