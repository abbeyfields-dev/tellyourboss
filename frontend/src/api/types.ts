import type { Gender } from '../data/profile';

export type { Gender };

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  industry?: string | null;
  gender?: Gender | 'UNSPECIFIED' | null;
  country?: string | null;
  location?: string | null;
  state?: string | null;
  postalCode?: string | null;
  ageGroup?: string | null;
  ethnicity?: string | null;
  education?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type Relationship = 'BOSS' | 'SKIP_LEVEL' | 'PEER' | 'REPORT' | 'STAKEHOLDER' | 'OTHER';

export type SubjectSummary = {
  id: string;
  displayName: string;
  roleTitle: string | null;
  company: string | null;
  industry?: string | null;
  gender?: Gender | 'UNSPECIFIED' | null;
  country?: string | null;
  location?: string | null;
  state?: string | null;
  postalCode?: string | null;
  ageGroup?: string | null;
  ethnicity?: string | null;
  education?: string | null;
  relationship: Relationship;
  scorecards: ScorecardSummary[];
  _count: { scorecards: number };
};

export type ScorecardSummary = {
  id: string;
  subjectId?: string;
  status: 'DRAFT' | 'COMPLETED';
  overall: number | null;
  archetype: string | null;
  answeredCount?: number;
  completedAt: string | null;
  updatedAt: string;
  subject?: { id: string; displayName?: string };
  _count?: { feedbackLinks: number };
};

export type PersonStatus = 'sent' | 'completed' | 'progress' | 'new';

export type RatingRequestItem = {
  id: string;
  recipientEmail: string;
  createdAt: string;
  status: 'waiting' | 'received';
  feedbackId: string | null;
};

export type InboxItem = {
  id: string;
  createdAt: string;
  blurb: string | null;
  overall: number | null;
  archetype: string | null;
  senderLabel: string | null;
  subjectName: string;
  selectedDimensionIds: string[];
  answers: { parameterId: string; value: number }[];
};

export type ScorecardDetail = ScorecardSummary & {
  subjectId: string;
  blurb: string | null;
  selectedDimensionIds?: string[];
  answers: { parameterId: string; value: number }[];
  subject?: { id: string; displayName: string };
};

export function latestCompleted(subject: SubjectSummary) {
  return subject.scorecards.find((card) => card.status === 'COMPLETED') ?? null;
}

export function latestDraft(subject: SubjectSummary) {
  return subject.scorecards.find((card) => card.status === 'DRAFT') ?? null;
}

export function resumableDraft(subject: SubjectSummary) {
  const draft = latestDraft(subject);
  if (!draft) return null;
  if (latestCompleted(subject) && (draft.answeredCount ?? 0) === 0) return null;
  return draft;
}

export function personStatus(subject: SubjectSummary): PersonStatus {
  if (resumableDraft(subject)) return 'progress';
  const completed = latestCompleted(subject);
  if (!completed) return 'new';
  return (completed._count?.feedbackLinks ?? 0) > 0 ? 'sent' : 'completed';
}

export function mergeSubjectScorecards(
  people: SubjectSummary[],
  cards: ScorecardSummary[],
): SubjectSummary[] {
  const extra = new Map<string, ScorecardSummary[]>();
  for (const card of cards) {
    const subjectId = card.subjectId ?? card.subject?.id;
    if (!subjectId) continue;
    const list = extra.get(subjectId) ?? [];
    list.push(card);
    extra.set(subjectId, list);
  }
  return people.map((person) => {
    const byId = new Map<string, ScorecardSummary>();
    for (const card of [...person.scorecards, ...(extra.get(person.id) ?? [])]) {
      byId.set(card.id, card);
    }
    const scorecards = [...byId.values()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return {
      ...person,
      scorecards,
      _count: { scorecards: Math.max(person._count.scorecards, scorecards.length) },
    };
  });
}
