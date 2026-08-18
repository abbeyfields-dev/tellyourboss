/** Boss-Rater — navy campaign chrome with royal-blue actions and gold XP. */
export const theme = {
  colors: {
    bg: '#141B30',
    bgMid: '#1B2440',
    bgElevated: '#FFFFFF',
    surface: '#F4F7FC',
    surfaceNavy: '#1E2744',
    border: 'rgba(20, 27, 48, 0.12)',
    borderNavy: 'rgba(255, 255, 255, 0.12)',
    ink: '#141B30',
    text: '#141B30',
    textMuted: 'rgba(20, 27, 48, 0.68)',
    textDim: 'rgba(20, 27, 48, 0.42)',
    onNavy: '#F4F7FC',
    onNavyMuted: 'rgba(244, 247, 252, 0.72)',
    onNavyDim: 'rgba(244, 247, 252, 0.46)',
    royal: '#0056D2',
    royalDeep: '#0046AD',
    royalSoft: '#E8F0FC',
    gold: '#F5B400',
    goldSoft: '#FFF3C4',
    teal: '#12B5A0',
    tangerine: '#FF7A1A',
    magenta: '#E23EC8',
    azure: '#3B82F6',
    onInk: '#FFFFFF',
    onCoral: '#FFFFFF',
    coral: '#FF4D6D',
    violet: '#5B3FFF',
    success: '#1FA97A',
    danger: '#C23B2A',
    scoreLow: '#FF4D6D',
    scoreMid: '#F5B400',
    scoreHigh: '#12B5A0',
  },
  space: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: '#141B30',
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  },
} as const;

export function scoreColor(score: number): string {
  if (score < 2.4) return theme.colors.scoreLow;
  if (score < 3.6) return theme.colors.scoreMid;
  return theme.colors.scoreHigh;
}

export function rankTitle(score: number): string {
  if (score < 2.4) return 'Needs a retry';
  if (score < 3.6) return 'Solid clear';
  return 'Perfect clear';
}

export function starCount(score: number): number {
  return Math.max(0, Math.min(5, Math.round(score)));
}
