import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Boss-O-Rater palette: primary CTA blue, ink, and cool surfaces. */
export const theme = {
  colors: {
    brand: '#14213D',
    brandDeep: '#14213D',
    brandSoft: '#EDF0FF',
    brandGlow: 'rgba(0, 80, 226, 0.28)',
    gold: '#0050E2',
    bg: '#F6F7FB',
    bgMid: '#F6F7FB',
    bgElevated: '#F6F7FB',
    surface: '#FFFFFF',
    surfaceNavy: '#14213D',
    paper: '#FFFFFF',
    border: '#E5E9F3',
    borderNavy: 'rgba(255, 255, 255, 0.22)',
    ink: '#14213D',
    text: '#14213D',
    textMuted: '#5C6A86',
    textDim: '#8E98B0',
    onNavy: '#FFFFFF',
    onNavyMuted: 'rgba(255, 255, 255, 0.78)',
    onNavyDim: 'rgba(255, 255, 255, 0.58)',
    lime: '#14213D',
    limeDeep: '#14213D',
    limeSoft: '#EDF0FF',
    onLime: '#FFFFFF',
    action: '#0050E2',
    accent: '#0050E2',
    royal: '#14213D',
    royalDeep: '#14213D',
    royalSoft: '#EDF0FF',
    goldSoft: '#F1E7DD',
    warm: '#F1E7DD',
    softBlue: '#94B4F1',
    paleBlue: '#EDF0FF',
    teal: '#17B3C6',
    tangerine: '#8B6CF0',
    magenta: '#8B6CF0',
    azure: '#94B4F1',
    onInk: '#FFFFFF',
    onCoral: '#FFFFFF',
    coral: '#14213D',
    violet: '#8B6CF0',
    success: '#087F5B',
    danger: '#D46A5C',
    scale5: '#26C617',
    scale4: '#17B3C6',
    scale3: '#8B6CF0',
    scale2: '#E4649A',
    scale1: '#F08A70',
    scoreLow: '#14213D',
    scoreMid: '#17B3C6',
    scoreHigh: '#0050E2',
  },
  space: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 32,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: '#14213D',
      shadowOpacity: 0.07,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    } satisfies ViewStyle,
  },
} as const;

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'Inter, system-ui, -apple-system, sans-serif',
});

export const type = {
  sans: { fontFamily } satisfies TextStyle,
  verdict: {
    fontFamily,
    fontWeight: '800',
    letterSpacing: -0.7,
  } satisfies TextStyle,
};

export function scoreColor(score: number): string {
  if (score >= 4.2) return theme.colors.scoreHigh;
  if (score >= 3.2) return theme.colors.scoreMid;
  if (score >= 2.4) return theme.colors.tangerine;
  return theme.colors.scoreLow;
}

export function starCount(score: number): number {
  return Math.max(0, Math.min(5, Math.round(score)));
}

export const AVATAR_PALETTE = ['#14213D', '#0050E2', '#087F5B', '#8B6CF0', '#17B3C6'] as const;

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
