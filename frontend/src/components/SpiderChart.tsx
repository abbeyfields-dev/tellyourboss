import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { DimensionScore } from '../data/score';
import { theme } from '../theme';

type Props = {
  rows: DimensionScore[];
};

const SHORT: Record<string, string> = {
  leadership: 'Leadership',
  communication: 'Comms',
  feedback: 'Feedback',
  personality: 'Vibes',
  innovation: 'Innovation',
  growth: 'Growth',
  shielding: 'Shielding',
};

function polar(cx: number, cy: number, radius: number, index: number, count: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function points(coords: { x: number; y: number }[]): string {
  return coords.map((point) => `${point.x},${point.y}`).join(' ');
}

export function SpiderChart({ rows }: Props): React.JSX.Element | null {
  if (rows.length < 3) return null;
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 104;
  const count = rows.length;
  const rings = [1, 2, 3, 4, 5].map((step) =>
    points(Array.from({ length: count }, (_, index) => polar(cx, cy, (radius * step) / 5, index, count))),
  );
  const spokes = Array.from({ length: count }, (_, index) => polar(cx, cy, radius, index, count));
  const shape = points(
    rows.map((row, index) => polar(cx, cy, (radius * Math.max(0, Math.min(5, row.average))) / 5, index, count)),
  );

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring) => (
          <Polygon key={ring} points={ring} fill="none" stroke="#D5DCEC" strokeWidth={1} />
        ))}
        {spokes.map((end, index) => (
          <Line key={`spoke-${index}`} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#D5DCEC" strokeWidth={1} />
        ))}
        <Polygon points={shape} fill="rgba(0, 80, 226, 0.22)" stroke={theme.colors.accent} strokeWidth={2} />
        {rows.map((row, index) => {
          const label = polar(cx, cy, radius + 28, index, count);
          const anchor = label.x < cx - 12 ? 'end' : label.x > cx + 12 ? 'start' : 'middle';
          return (
            <SvgText
              key={row.dimension.id}
              x={label.x}
              y={label.y}
              fill={theme.colors.ink}
              fontSize={11}
              fontWeight="600"
              textAnchor={anchor}
            >
              {SHORT[row.dimension.id] ?? row.dimension.title.split(' ')[0]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});
