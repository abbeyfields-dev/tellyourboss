import React from 'react';
import { Image, StyleSheet, type StyleProp, type ImageStyle } from 'react-native';
import { APP_NAME, brandLogo } from '../brand';

type Props = {
  width?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ width = 220, style }: Props): React.JSX.Element {
  return (
    <Image
      source={brandLogo}
      accessibilityLabel={APP_NAME}
      resizeMode="contain"
      style={[styles.logo, { width, height: Math.round(width * 0.66) }, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
