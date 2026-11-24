import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  size?: number;
  color?: string;
};

export function CrownMark({ size = 32, color = theme.colors.gold }: Props): React.JSX.Element {
  const gem = Math.max(4, Math.round(size * 0.15));
  const band = Math.max(4, Math.round(size * 0.16));
  const bodyH = Math.round(size * 0.28);
  const peak = Math.round(size * 0.22);

  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessibilityLabel="Boss-O-Rater">
      <View style={[styles.gems, { width: size * 0.72 }]}>
        <View style={[styles.gem, { width: gem, height: gem, backgroundColor: color }]} />
        <View style={[styles.gem, { width: gem + 2, height: gem + 2, backgroundColor: color }]} />
        <View style={[styles.gem, { width: gem, height: gem, backgroundColor: color }]} />
      </View>
      <View style={[styles.peaks, { width: size * 0.7, height: peak }]}>
        <View style={[styles.peak, { width: size * 0.16, height: peak * 0.7, backgroundColor: color }]} />
        <View style={[styles.peak, { width: size * 0.18, height: peak, backgroundColor: color }]} />
        <View style={[styles.peak, { width: size * 0.16, height: peak * 0.7, backgroundColor: color }]} />
      </View>
      <View style={[styles.body, { width: size * 0.78, height: bodyH, backgroundColor: color }]} />
      <View style={[styles.band, { width: size * 0.88, height: band, borderRadius: band / 2, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  gems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  gem: {
    borderRadius: 99,
  },
  peaks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: -2,
  },
  peak: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  body: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  band: {
    marginTop: 3,
  },
});
