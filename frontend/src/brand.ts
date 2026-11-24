import type { ImageSourcePropType } from 'react-native';

export const APP_NAME = 'Boss-O-Rater';
export const TAGLINE = 'Feedback that lifts everyone';
export const TAGLINE_HOOK = 'Give structured, behavior-based feedback to anyone you work with.';
export const SHARE_SUBJECT = 'Someone rated you on boss-o-rater.';

export function shareSubject(name?: string | null): string {
  const who = name?.replace(/\s+/g, ' ').trim();
  if (!who) return SHARE_SUBJECT;
  return `${who.slice(0, 80)}, someone rated you on boss-o-rater.`.slice(0, 160);
}
export const OPINION_DISCLAIMER = 'This feedback reflects the sender’s opinion, not boss-o-rater’s.';

export const brandLogo: ImageSourcePropType = require('../assets/boss-rater-logo.png');
