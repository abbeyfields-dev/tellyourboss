import { APP_NAME, OPINION_DISCLAIMER, shareSubject, TAGLINE, TAGLINE_HOOK } from '../brand';
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

type ScorecardLine = {
  title: string;
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

function pickIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return length === 0 ? 0 : hash % length;
}

function pick<T>(items: readonly T[], seed: string): T {
  return items[pickIndex(seed, items.length)];
}

export function answersSeed(answers: Answers, extra = ''): string {
  const keys = Object.keys(answers).sort();
  return `${keys.map((key) => `${key}:${answers[key]}`).join('|')}|${extra}`;
}

function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function verb(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function categorySummary(dimension: Dimension, answers: Answers): string {
  const rated = dimension.parameters
    .map((parameter) => ({ title: parameter.title, value: answers[parameter.id] }))
    .filter((row): row is { title: string; value: ScaleValue } => row.value != null);
  if (rated.length === 0) return 'This category has no answers yet.';

  const high = rated.filter((row) => row.value >= 4);
  const low = rated.filter((row) => row.value <= 2).sort((a, b) => a.value - b.value);
  const top = high.slice(0, 3).map((row) => row.title);
  const bottom = low.slice(0, 2).map((row) => row.title);
  const spread = Math.max(...rated.map((row) => row.value)) - Math.min(...rated.map((row) => row.value));
  const name = dimension.title;

  if (spread <= 1 && high.length === rated.length) {
    return `${name} is even and strong. ${listNames(top)} ${verb(top.length, 'shows', 'show')} up consistently, so colleagues would likely see this whole category as a strength.`;
  }
  if (spread <= 1 && low.length === rated.length) {
    return `${name} is even and low. ${listNames(bottom)} ${verb(bottom.length, 'lands', 'land')} on the weak side, so this is a gap colleagues would feel across the category.`;
  }
  if (spread <= 1) {
    return `${name} is steady rather than standout. The answers sit close together, so colleagues would see this as consistent without a clear strength or gap.`;
  }
  if (top.length > 0 && bottom.length > 0) {
    return `${name} is uneven. ${listNames(top)} ${verb(top.length, 'stands', 'stand')} out, while ${listNames(bottom)} ${verb(bottom.length, 'is', 'are')} where the rating drops.`;
  }
  if (top.length > 0) {
    return `${name} comes through as a strength. ${listNames(top)} ${verb(top.length, 'is', 'are')} the strongest signal${top.length === 1 ? '' : 's'}, and nothing in this category landed low.`;
  }
  return `${name} is the weaker part of this rating. ${listNames(bottom)} ${verb(bottom.length, 'is', 'are')} where colleagues would feel the gap.`;
}

const SCORECARD_LINES: { max: number; lines: readonly ScorecardLine[] }[] = [
  {
    max: 1.8,
    lines: [
      {
        title: 'Exit Interview Fuel',
        blurb: 'The commentary writes itself. None of it is kind.',
      },
      {
        title: 'Start Updating the Doc',
        blurb: 'This is not a development plan. It is a timeline.',
      },
    ],
  },
  {
    max: 2.4,
    lines: [
      {
        title: 'The Plot Twist',
        blurb: 'This scorecard is a skip-level meeting waiting to happen.',
      },
      {
        title: 'Hard Pass Energy',
        blurb: 'People are already practicing the polite version of this story.',
      },
    ],
  },
  {
    max: 3.0,
    lines: [
      {
        title: 'Rough Draft',
        blurb: 'A few sparks, a lot of static. The team is carrying extra weight.',
      },
      {
        title: 'Mixed Signals',
        blurb: 'Some days they manage. Some days the team manages around them.',
      },
    ],
  },
  {
    max: 3.6,
    lines: [
      {
        title: 'Standard Issue',
        blurb: 'Not a villain, not a legend. Deeply, reliably corporate.',
      },
      {
        title: 'Deeply Corporate',
        blurb: 'Nobody is quitting over this. Nobody is writing a thank-you note either.',
      },
      {
        title: 'Fine, Next Slide',
        blurb: 'They clear the bar. The bar was on the floor.',
      },
    ],
  },
  {
    max: 4.2,
    lines: [
      {
        title: 'Quietly Competent',
        blurb: 'They run a room. They don’t need a statue.',
      },
      {
        title: 'Good Manager, No Myth',
        blurb: 'The work gets done and people still have a Friday. That is the product.',
      },
    ],
  },
  {
    max: 4.8,
    lines: [
      {
        title: 'Keep This One',
        blurb: 'The kind of boss people mention when they say the team is good, actually.',
      },
      {
        title: 'The Reason People Stay',
        blurb: 'Compensation helps. They are why the offer letter still feels true.',
      },
    ],
  },
  {
    max: 5.01,
    lines: [
      {
        title: 'The Real Thing',
        blurb: 'You found a gem. Stick with them.',
      },
      {
        title: 'Don’t Lose This One',
        blurb: 'Protect this energy. Recruiting would start a war.',
      },
    ],
  },
];

function band<T>(score: number, table: { max: number; lines: readonly T[] }[]): readonly T[] {
  return table.find((row) => score < row.max)?.lines ?? table[table.length - 1].lines;
}

export function categoryComment(_average: number, dimensionId: string, answers: Answers): string {
  const dimension = DIMENSIONS.find((row) => row.id === dimensionId);
  if (!dimension) return 'This category has no answers yet.';
  return categorySummary(dimension, answers);
}

export function scorecardCopy(overall: number, answers: Answers): ScorecardLine {
  return pick(band(overall, SCORECARD_LINES), answersSeed(answers, `scorecard:${overall.toFixed(2)}`));
}

export function archetypeFor(overall: number, answers: Answers = {}): ScorecardLine {
  return scorecardCopy(overall, answers);
}

export function answersFromScorecard(rows: { parameterId: string; value: number }[]): Answers {
  const next: Answers = {};
  for (const row of rows) {
    if (row.value === 1 || row.value === 2 || row.value === 3 || row.value === 4 || row.value === 5) {
      next[row.parameterId] = row.value;
    }
  }
  return next;
}

export function buildResult(answers: Answers, dimensionIds?: string[]): QuizResult {
  const selected = dimensionIds?.length
    ? DIMENSIONS.filter((dimension) => dimensionIds.includes(dimension.id))
    : DIMENSIONS;
  const dimensions = (selected.length > 0 ? selected : DIMENSIONS).map((dimension) =>
    scoreDimension(dimension, answers),
  );
  const allowed = new Set(dimensions.flatMap((row) => row.dimension.parameters.map((parameter) => parameter.id)));
  const values = Object.entries(answers)
    .filter(([id]) => allowed.has(id))
    .map(([, value]) => value);
  const overall = average(values);
  const scored = dimensions.filter((row) => row.filled > 0);
  const pool = scored.length > 0 ? scored : dimensions;
  const strongest = pool.reduce((best, current) => (current.average > best.average ? current : best));
  const weakest = pool.reduce((worst, current) => (current.average < worst.average ? current : worst));
  const { title, blurb } = scorecardCopy(overall, answers);
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

export function scoreBand(score: number): 'high' | 'mid' | 'mixed' | 'low' {
  if (score >= 4.2) return 'high';
  if (score >= 3.2) return 'mid';
  if (score >= 2.4) return 'mixed';
  return 'low';
}

export type ShareChannel = 'self' | 'anonymous';

export function resultShareText(result: QuizResult, subjectName?: string | null): string {
  const who = subjectName?.trim();
  const rows = result.dimensions
    .map((row) => `${row.dimension.title}: ${formatScore(row.average)} / 5`)
    .join('\n');
  return [
    who
      ? `${APP_NAME} scorecard for ${who}: ${formatScore(result.overall)} / 5`
      : `${APP_NAME} scorecard: ${formatScore(result.overall)} / 5`,
    `${result.archetype} — ${result.blurb}`,
    '',
    rows,
    '',
    `Best: ${result.strongest.dimension.title} (${formatScore(result.strongest.average)})`,
    `Needs work: ${result.weakest.dimension.title} (${formatScore(result.weakest.average)})`,
  ].join('\n');
}

export function scorecardEmailTemplate(
  result: QuizResult,
  subjectName?: string | null,
): { subject: string; body: string } {
  const who = subjectName?.trim();
  const greeting = who ? `Hello ${who},` : 'Hello,';
  return {
    subject: shareSubject(who),
    body: [
      greeting,
      '',
      'Someone rated you on boss-o-rater.',
      '',
      resultShareText(result, who),
      '',
      OPINION_DISCLAIMER,
      '',
      `${TAGLINE} — ${TAGLINE_HOOK}`,
    ].join('\n'),
  };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function scorecardMailto(to: string, subject: string, body: string): string {
  return `mailto:${to.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
