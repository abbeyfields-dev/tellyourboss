export const INSIGHTS_DISCLAIMER =
  'This survey is only used to generate compatibility insights. It will not be shared with anyone.';

export const GENDERS = [
  { id: 'MAN', label: 'Male' },
  { id: 'WOMAN', label: 'Female' },
  { id: 'NONBINARY', label: 'Other' },
  { id: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

export type Gender = (typeof GENDERS)[number]['id'];

export const INDUSTRIES = [
  'Agriculture',
  'Construction',
  'Education',
  'Energy',
  'Finance',
  'Government',
  'Healthcare',
  'Hospitality',
  'Information Technology',
  'Manufacturing',
  'Media and Entertainment',
  'Nonprofit',
  'Professional Services',
  'Retail',
  'Transportation',
  'Other',
] as const;

export const COUNTRIES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czechia',
  'Democratic Republic of the Congo',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
  'Other',
] as const;

export const AGE_GROUPS = [
  { id: '18_25', label: '18–25' },
  { id: '26_35', label: '26–35' },
  { id: '36_45', label: '36–45' },
  { id: '46_55', label: '46–55' },
  { id: '56_65', label: '56–65' },
  { id: '66_PLUS', label: '66+' },
  { id: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

export const EDUCATIONS = [
  { id: 'HIGH_SCHOOL', label: 'High school' },
  { id: 'ASSOCIATE', label: 'Associate degree' },
  { id: 'BACHELOR', label: "Bachelor's degree" },
  { id: 'MASTER', label: "Master's degree" },
  { id: 'PROFESSIONAL', label: 'Professional degree' },
  { id: 'DOCTORATE', label: 'Doctorate' },
  { id: 'OTHER', label: 'Other' },
  { id: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

export const ETHNICITIES = [
  { id: 'ASIAN', label: 'Asian' },
  { id: 'BLACK', label: 'Black or African' },
  { id: 'HISPANIC', label: 'Hispanic or Latino' },
  { id: 'MIDDLE_EASTERN', label: 'Middle Eastern or North African' },
  { id: 'INDIGENOUS', label: 'Native American or Indigenous' },
  { id: 'PACIFIC_ISLANDER', label: 'Pacific Islander' },
  { id: 'WHITE', label: 'White' },
  { id: 'TWO_OR_MORE', label: 'Two or more' },
  { id: 'OTHER', label: 'Other' },
  { id: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

export type InsightDraft = {
  displayName: string;
  country: string;
  countryOther: string;
  location: string;
  state: string;
  postalCode: string;
  ageGroup: string | null;
  gender: Gender | null;
  industry: string;
  industryOther: string;
  ethnicity: string | null;
  education: string | null;
};

export type InsightInput = {
  displayName: string;
  country: string | null;
  location: string | null;
  state: string | null;
  postalCode: string | null;
  ageGroup: string | null;
  gender: Gender | null;
  industry: string | null;
  ethnicity: string | null;
  education: string | null;
};

export function genderLabel(value: string | null | undefined): string | null {
  return GENDERS.find((item) => item.id === value)?.label ?? null;
}

export function ageGroupLabel(value: string | null | undefined): string | null {
  return AGE_GROUPS.find((item) => item.id === value)?.label ?? null;
}

function splitKnown(value: string | null | undefined, known: readonly string[]): { selected: string; other: string } {
  if (!value) return { selected: '', other: '' };
  if (known.includes(value)) return { selected: value, other: '' };
  return { selected: 'Other', other: value === 'Other' ? '' : value };
}

export function emptyInsight(name = ''): InsightDraft {
  return {
    displayName: name,
    country: '',
    countryOther: '',
    location: '',
    state: '',
    postalCode: '',
    ageGroup: null,
    gender: null,
    industry: '',
    industryOther: '',
    ethnicity: null,
    education: null,
  };
}

export function insightDraftFromStored(input: {
  displayName?: string | null;
  country?: string | null;
  location?: string | null;
  state?: string | null;
  postalCode?: string | null;
  ageGroup?: string | null;
  gender?: string | null;
  industry?: string | null;
  ethnicity?: string | null;
  education?: string | null;
}): InsightDraft {
  const country = splitKnown(input.country, COUNTRIES);
  const industry = splitKnown(input.industry, INDUSTRIES);
  const gender = GENDERS.some((item) => item.id === input.gender) ? (input.gender as Gender) : null;
  const ageGroup = AGE_GROUPS.some((item) => item.id === input.ageGroup) ? input.ageGroup ?? null : null;
  const ethnicity = ETHNICITIES.some((item) => item.id === input.ethnicity) ? input.ethnicity ?? null : null;
  const education = EDUCATIONS.some((item) => item.id === input.education) ? input.education ?? null : null;
  return {
    displayName: input.displayName ?? '',
    country: country.selected,
    countryOther: country.other,
    location: input.location ?? '',
    state: input.state ?? '',
    postalCode: input.postalCode ?? '',
    ageGroup,
    gender,
    industry: industry.selected,
    industryOther: industry.other,
    ethnicity,
    education,
  };
}

function resolveOther(selected: string, other: string): string | null {
  if (!selected) return null;
  if (selected === 'Other') return other.trim() || 'Other';
  return selected;
}

export function insightInputFromDraft(draft: InsightDraft): InsightInput {
  return {
    displayName: draft.displayName.trim(),
    country: resolveOther(draft.country, draft.countryOther),
    location: draft.location.trim() || null,
    state: draft.state.trim() || null,
    postalCode: draft.postalCode.trim() || null,
    ageGroup: draft.ageGroup,
    gender: draft.gender,
    industry: resolveOther(draft.industry, draft.industryOther),
    ethnicity: draft.ethnicity,
    education: draft.education,
  };
}
