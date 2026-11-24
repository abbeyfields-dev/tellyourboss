export type ScaleValue = 1 | 2 | 3 | 4 | 5;

export type CatalogDimension = {
  id: string;
  title: string;
  parameterIds: string[];
};

export const DIMENSIONS: CatalogDimension[] = [
  {
    id: 'leadership',
    title: 'Leadership Style & Vibes',
    parameterIds: [
      'leadership-vision',
      'leadership-crisis',
      'leadership-freedom',
      'leadership-inclusivity',
      'leadership-flexibility',
    ],
  },
  {
    id: 'communication',
    title: 'Communication Style',
    parameterIds: [
      'communication-email',
      'communication-response',
      'communication-meetings',
      'communication-approachability',
      'communication-listening',
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback Style',
    parameterIds: [
      'feedback-delivery',
      'feedback-frequency',
      'feedback-actionability',
      'feedback-credit',
      'feedback-reception',
    ],
  },
  {
    id: 'personality',
    title: 'Personality & Workspace Vibes',
    parameterIds: [
      'personality-empathy',
      'personality-humor',
      'personality-regulation',
      'personality-balance',
      'personality-energy',
    ],
  },
  {
    id: 'innovation',
    title: 'Innovation & Risk Appetite',
    parameterIds: [
      'innovation-ideas',
      'innovation-failure',
      'innovation-resources',
      'innovation-bureaucracy',
      'innovation-future',
    ],
  },
  {
    id: 'growth',
    title: 'Career Growth & Advocacy',
    parameterIds: [
      'growth-hype',
      'growth-stretch',
      'growth-mentorship',
      'growth-network',
      'growth-promotion',
    ],
  },
  {
    id: 'shielding',
    title: 'Team Shielding & Politics',
    parameterIds: [
      'shielding-defense',
      'shielding-scope',
      'shielding-politics',
      'shielding-resources',
      'shielding-transparency',
    ],
  },
];

export const PARAMETER_TO_DIMENSION = Object.fromEntries(
  DIMENSIONS.flatMap((dimension) => dimension.parameterIds.map((id) => [id, dimension.id])),
) as Record<string, string>;

export const QUESTION_COUNT = DIMENSIONS.reduce((sum, dimension) => sum + dimension.parameterIds.length, 0);

export function isScaleValue(value: number): value is ScaleValue {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function archetypeFor(overall: number): { title: string; blurb: string } {
  if (overall < 1.8) {
    return {
      title: 'The Plot Twist',
      blurb: 'This scorecard is a skip-level meeting waiting to happen.',
    };
  }
  if (overall < 2.6) {
    return {
      title: 'Rough Draft Manager',
      blurb: 'A few sparks, a lot of static. The team is carrying extra weight.',
    };
  }
  if (overall < 3.4) {
    return {
      title: 'Standard Issue Boss',
      blurb: 'Not a villain, not a legend. Deeply, reliably corporate.',
    };
  }
  if (overall < 4.2) {
    return {
      title: 'Keep This One',
      blurb: 'The kind of boss people mention when they say the team is good actually.',
    };
  }
  return {
    title: 'Rare Pokémon Boss',
    blurb: 'Protect this energy. Do not let recruiting know they exist.',
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export type BuiltResult = {
  overall: number;
  answered: number;
  strongestDimension: string | null;
  weakestDimension: string | null;
  archetype: string | null;
  blurb: string | null;
  dimensions: { dimensionId: string; average: number; filled: number }[];
};

export function buildResult(answers: Record<string, number>): BuiltResult {
  const dimensions = DIMENSIONS.map((dimension) => {
    const values = dimension.parameterIds
      .map((id) => answers[id])
      .filter((value): value is number => typeof value === 'number');
    return {
      dimensionId: dimension.id,
      average: average(values),
      filled: values.length,
    };
  });
  const values = Object.values(answers);
  const overall = average(values);
  const scored = dimensions.filter((row) => row.filled > 0);
  const strongest = scored.reduce<(typeof scored)[number] | null>(
    (best, current) => (!best || current.average > best.average ? current : best),
    null,
  );
  const weakest = scored.reduce<(typeof scored)[number] | null>(
    (worst, current) => (!worst || current.average < worst.average ? current : worst),
    null,
  );
  const { title, blurb } = values.length === 0 ? { title: null, blurb: null } : archetypeFor(overall);
  return {
    overall,
    answered: values.length,
    strongestDimension: strongest?.dimensionId ?? null,
    weakestDimension: weakest?.dimensionId ?? null,
    archetype: title,
    blurb,
    dimensions,
  };
}
