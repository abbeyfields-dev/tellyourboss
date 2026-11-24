import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme, type } from '../theme';

export type AppTab = 'home' | 'rate' | 'feedback' | 'me';

type Props = {
  active: AppTab;
  bottomInset?: number;
  feedbackUnread?: number;
  onChange: (tab: AppTab) => void;
};

const TABS: { id: AppTab; label: string; hint: string }[] = [
  { id: 'home', label: 'Home', hint: 'Your overview' },
  { id: 'rate', label: 'Ratings', hint: 'Choose someone to rate' },
  { id: 'feedback', label: 'Feedbacks', hint: 'Feedback sent to you' },
  { id: 'me', label: 'Me', hint: 'Your profile' },
];

function TabIcon({ id, color }: { id: AppTab; color: string }): React.JSX.Element {
  if (id === 'home') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (id === 'rate') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="m12 3.5 2.2 4.6 5.1.7-3.7 3.6.9 5.1L12 15.1 7.5 17.5l.9-5.1L4.7 8.8l5.1-.7L12 3.5Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (id === 'feedback') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={7.2} stroke={color} strokeWidth={1.8} />
        <Path d="M12 8.2V12l2.6 1.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.2} stroke={color} strokeWidth={1.8} />
      <Path d="M6.2 18.5c1.2-2.4 3.2-3.6 5.8-3.6s4.6 1.2 5.8 3.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function BottomNav({ active, bottomInset = 0, feedbackUnread = 0, onChange }: Props): React.JSX.Element {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {TABS.map((tab) => {
        const on = tab.id === active;
        const color = on ? theme.colors.accent : theme.colors.textDim;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={`${tab.label}. ${tab.hint}`}
            accessibilityState={{ selected: on }}
          >
            <View>
              <TabIcon id={tab.id} color={color} />
              {tab.id === 'feedback' && feedbackUnread > 0 ? <View style={styles.dot} /> : null}
            </View>
            <Text style={[styles.label, on && styles.labelOn]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingTop: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    ...type.sans,
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  labelOn: {
    color: theme.colors.accent,
  },
  dot: {
    position: 'absolute',
    top: -1,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0912B',
  },
});
