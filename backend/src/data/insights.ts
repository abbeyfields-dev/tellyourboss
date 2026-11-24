import { ValidationError } from '../utils/errors';

export const AGE_GROUPS = ['18_25', '26_35', '36_45', '46_55', '56_65', '66_PLUS', 'PREFER_NOT_TO_SAY'] as const;

export const EDUCATIONS = [
  'HIGH_SCHOOL',
  'ASSOCIATE',
  'BACHELOR',
  'MASTER',
  'PROFESSIONAL',
  'DOCTORATE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
] as const;

export const ETHNICITIES = [
  'ASIAN',
  'BLACK',
  'HISPANIC',
  'MIDDLE_EASTERN',
  'INDIGENOUS',
  'PACIFIC_ISLANDER',
  'WHITE',
  'TWO_OR_MORE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
] as const;

export function cleanText(value: unknown, label: string, max = 80): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new ValidationError(`${label} must be text.`);
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) throw new ValidationError(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function parseChoice(value: unknown, allowed: readonly string[], label: string): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new ValidationError(`Choose a ${label}, or leave it unset.`);
  }
  return value;
}
