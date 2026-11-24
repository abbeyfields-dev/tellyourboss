import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AvatarBubble } from './AvatarBubble';
import { BrandLogo } from './BrandLogo';

type Props = {
  initial?: string;
  onAvatarPress?: () => void;
  light?: boolean;
};

export function AppHeader({ initial, onAvatarPress }: Props): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <BrandLogo width={148} />
      </View>
      {initial ? (
        <Pressable onPress={onAvatarPress} hitSlop={8} accessibilityLabel="Account">
          <AvatarBubble name={initial} size={44} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
