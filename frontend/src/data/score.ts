import { DIMENSIONS, type Dimension, type ScaleValue } from './dimensions';

export type Answers = Record<string, ScaleValue>;

export type DimensionScore = {
  dimension: Dimension;
  average: number;
  filled: number;
};

export type QuizResult = {
  overall: number;
  answered: number;
  dimensions: DimensionScore[];
  strongest: DimensionScore;
  weakest: DimensionScore;
  archetype: string;
  blurb: string;
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function scoreDimension(dimension: Dimension, answers: Answers): DimensionScore {
  const values = dimension.parameters
    .map((parameter) => answers[parameter.id])
    .filter((value): value is ScaleValue => typeof value === 'number');
  return {
    dimension,
    average: average(values),
    filled: values.length,
  };
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

export function buildResult(answers: Answers): QuizResult {
  const dimensions = DIMENSIONS.map((dimension) => scoreDimension(dimension, answers));
  const values = Object.values(answers);
  const overall = average(values);
  const strongest = dimensions.reduce((best, current) =>
    current.average > best.average ? current : best,
  );
  const weakest = dimensions.reduce((worst, current) =>
    current.average < worst.average ? current : worst,
  );
  const { title, blurb } = archetypeFor(overall);
  return {
    overall,
    answered: values.length,
    dimensions,
    strongest,
    weakest,
    archetype: title,
    blurb,
  };
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function resultShareText(result: QuizResult): string {
  const rows = result.dimensions
    .map((row) => `${row.dimension.emoji} ${row.dimension.title}: ${formatScore(row.average)} / 5`)
    .join('\n');
  return [
    `Boss-Rater scorecard: ${formatScore(result.overall)} / 5`,
    `${result.archetype} — ${result.blurb}`,
    '',
    rows,
    '',
    `Best: ${result.strongest.dimension.title} (${formatScore(result.strongest.average)})`,
    `Needs work: ${result.weakest.dimension.title} (${formatScore(result.weakest.average)})`,
  ].join('\n');
}
