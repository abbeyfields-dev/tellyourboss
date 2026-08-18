import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from 'react-native';
import { brandLogo } from '../brand';
import { theme } from '../theme';

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
        <Image source={brandLogo} style={styles.logo} resizeMode="contain" accessibilityLabel="Boss-Rater" />
      </Animated.View>
      <View style={styles.boot}>
        <ActivityIndicator color={theme.colors.royal} />
        <Text style={styles.bootLabel}>{ready ? 'Entering the campaign' : 'Preparing your campaign'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
  },
  logoWrap: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 220,
  },
  boot: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    gap: 10,
  },
  bootLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
