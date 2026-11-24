import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';

type Props = {
  children: React.ReactNode;
  delay?: number;
  fill?: boolean;
};

export function FadeMount({ children, delay = 0, fill = true }: Props): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    let cancelled = false;
    opacity.setValue(0);
    translate.setValue(8);
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          opacity.setValue(1);
          translate.setValue(0);
          return;
        }
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 280, delay, useNativeDriver: true }),
          Animated.timing(translate, { toValue: 0, duration: 280, delay, useNativeDriver: true }),
        ]).start();
      })
      .catch(() => {
        if (cancelled) return;
        opacity.setValue(1);
        translate.setValue(0);
      });
    return () => {
      cancelled = true;
    };
  }, [delay, opacity, translate]);

  return (
    <Animated.View style={{ flex: fill ? 1 : undefined, minHeight: fill ? 0 : undefined, opacity, transform: [{ translateY: translate }] }}>
      {children}
    </Animated.View>
  );
}
