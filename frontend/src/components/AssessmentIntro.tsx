import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DIMENSIONS, countQuestions, dimensionsByIds } from '../data/dimensions';
import { theme, type } from '../theme';
import { AvatarBubble } from './AvatarBubble';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  subjectName: string;
  subjectMeta?: string | null;
  initialSelected?: string[];
  error?: string | null;
  onStart: (dimensionIds: string[]) => void;
  onBack: () => void;
};

export function AssessmentIntro({
  subjectName,
  subjectMeta,
  initialSelected,
  error,
  onStart,
  onBack,
}: Props): React.JSX.Element {
  const [selected, setSelected] = useState<string[]>(
    initialSelected && initialSelected.length > 0 ? initialSelected : DIMENSIONS.map((dimension) => dimension.id),
  );
  const chosen = dimensionsByIds(selected.length === DIMENSIONS.length ? [] : selected);
  const count = selected.length === 0 ? 0 : countQuestions(chosen);

  const toggle = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} accessibilityRole="button" style={styles.backHit}>
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>
      <View style={styles.hero}>
        <View style={styles.who}>
          <AvatarBubble name={subjectName} size={52} />
          <View style={styles.whoCopy}>
            <Text style={styles.name}>{subjectName}</Text>
            {subjectMeta ? <Text style={styles.role}>{subjectMeta}</Text> : null}
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>Choose categories</Text>
          <Text style={styles.muted}>{count} questions</Text>
        </View>
        <Text style={styles.cardCopy}>Pick the categories you want to rate. You can leave some out.</Text>
        {DIMENSIONS.map((dimension) => {
          const on = selected.includes(dimension.id);
          return (
            <Pressable key={dimension.id} onPress={() => toggle(dimension.id)} style={styles.option} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
              <View style={[styles.box, on && styles.boxOn]}>
                {on ? <Text style={styles.boxMark}>✓</Text> : null}
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{dimension.title}</Text>
                <Text style={styles.optionMeta}>{dimension.parameters.length} questions</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy</Text>
        <Text style={styles.cardCopy}>
          Nothing is sent until the end. You’ll choose anonymous or identified sharing then.
        </Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        variant="accent"
        label="Start rating"
        onPress={() => onStart(selected)}
        disabled={selected.length === 0}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 28,
    gap: 14,
  },
  backHit: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
  },
  back: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  hero: {
    backgroundColor: theme.colors.brand,
    borderRadius: theme.radius.xl,
    padding: 22,
    gap: 14,
  },
  who: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whoCopy: {
    flex: 1,
  },
  name: {
    ...type.sans,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  role: {
    ...type.sans,
    color: theme.colors.onNavyMuted,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 8,
    ...theme.shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  muted: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  cardCopy: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  boxMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  optionMeta: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  error: {
    ...type.sans,
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
