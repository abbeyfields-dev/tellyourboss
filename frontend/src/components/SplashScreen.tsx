import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { TAGLINE } from '../brand';
import { theme, type } from '../theme';
import { BrandLogo } from './BrandLogo';

type Props = {
  ready: boolean;
  onFinished: () => void;
};

const HOLD_MS = 1600;

export function SplashScreen({ ready, onFinished }: Props): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(onFinished, HOLD_MS);
    return () => clearTimeout(timer);
  }, [onFinished, ready]);

  return (
    <View style={styles.wrap} accessibilityRole="image">
      <StatusBar style="dark" />
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <BrandLogo width={280} />
        <Text style={styles.tagline}>{TAGLINE}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#F7F4EF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  tagline: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
});
