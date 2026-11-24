import type { Gender, Prisma, Relationship } from '@prisma/client';
import prisma from '../config/database';
import { AGE_GROUPS, EDUCATIONS, ETHNICITIES, cleanText, parseChoice } from '../data/insights';
import { NotFoundError, ValidationError } from '../utils/errors';

const RELATIONSHIPS: Relationship[] = ['BOSS', 'SKIP_LEVEL', 'PEER', 'REPORT', 'STAKEHOLDER', 'OTHER'];
const GENDERS: Gender[] = ['WOMAN', 'MAN', 'NONBINARY', 'PREFER_NOT_TO_SAY', 'UNSPECIFIED'];

function parseRelationship(value: unknown): Relationship {
  if (value == null || value === '') return 'OTHER';
  if (typeof value !== 'string' || !RELATIONSHIPS.includes(value as Relationship)) {
    throw new ValidationError(`relationship must be one of: ${RELATIONSHIPS.join(', ')}`);
  }
  return value as Relationship;
}

function parseGender(value: unknown): Gender {
  if (value == null || value === '') return 'UNSPECIFIED';
  if (typeof value !== 'string' || !GENDERS.includes(value as Gender)) {
    throw new ValidationError('Choose a gender, or leave it unset.');
  }
  return value as Gender;
}

const subjectInclude = {
  scorecards: {
    orderBy: { createdAt: 'desc' as const },
    take: 8,
    select: {
      id: true,
      status: true,
      overall: true,
      archetype: true,
      answeredCount: true,
      completedAt: true,
      updatedAt: true,
      _count: { select: { feedbackLinks: true } },
    },
  },
  _count: { select: { scorecards: true } },
};

export class SubjectService {
  static async list(userId: string, includeArchived = false) {
    const where: Prisma.SubjectWhereInput = { userId };
    if (!includeArchived) where.archivedAt = null;
    return prisma.subject.findMany({
      where,
      include: subjectInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async get(userId: string, id: string) {
    const subject = await prisma.subject.findFirst({
      where: { id, userId },
      include: {
        scorecards: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            overall: true,
            archetype: true,
            answeredCount: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { feedbackLinks: true } },
          },
        },
      },
    });
    if (!subject) throw new NotFoundError('Person not found.');
    return subject;
  }

  static async create(
    userId: string,
    input: {
      displayName: string;
      roleTitle?: string;
      company?: string;
      industry?: string;
      gender?: unknown;
      country?: unknown;
      location?: unknown;
      state?: unknown;
      postalCode?: unknown;
      ageGroup?: unknown;
      ethnicity?: unknown;
      education?: unknown;
      relationship?: unknown;
      notes?: string;
    },
  ) {
    const displayName = input.displayName?.trim();
    if (!displayName) throw new ValidationError('displayName is required.');
    return prisma.subject.create({
      data: {
        userId,
        displayName,
        roleTitle: input.roleTitle?.trim() || null,
        company: input.company?.trim() || null,
        industry: cleanText(input.industry, 'Industry'),
        gender: parseGender(input.gender),
        country: cleanText(input.country, 'Country'),
        location: cleanText(input.location, 'Location'),
        state: cleanText(input.state, 'State'),
        postalCode: cleanText(input.postalCode, 'Postal code', 16),
        ageGroup: parseChoice(input.ageGroup, AGE_GROUPS, 'age group'),
        ethnicity: parseChoice(input.ethnicity, ETHNICITIES, 'ethnicity'),
        education: parseChoice(input.education, EDUCATIONS, 'education'),
        relationship: parseRelationship(input.relationship),
        notes: input.notes?.trim() || null,
      },
      include: subjectInclude,
    });
  }

  static async update(
    userId: string,
    id: string,
    input: {
      displayName?: string;
      roleTitle?: string | null;
      company?: string | null;
      industry?: string | null;
      gender?: unknown;
      country?: unknown;
      location?: unknown;
      state?: unknown;
      postalCode?: unknown;
      ageGroup?: unknown;
      ethnicity?: unknown;
      education?: unknown;
      relationship?: unknown;
      notes?: string | null;
      archived?: boolean;
    },
  ) {
    await this.get(userId, id);
    const displayName = input.displayName?.trim();
    if (input.displayName !== undefined && !displayName) {
      throw new ValidationError('Name is required.');
    }
    return prisma.subject.update({
      where: { id },
      data: {
        displayName,
        roleTitle: input.roleTitle === undefined ? undefined : input.roleTitle?.trim() || null,
        company: input.company === undefined ? undefined : input.company?.trim() || null,
        industry: input.industry === undefined ? undefined : cleanText(input.industry, 'Industry'),
        gender: input.gender === undefined ? undefined : parseGender(input.gender),
        country: input.country === undefined ? undefined : cleanText(input.country, 'Country'),
        location: input.location === undefined ? undefined : cleanText(input.location, 'Location'),
        state: input.state === undefined ? undefined : cleanText(input.state, 'State'),
        postalCode: input.postalCode === undefined ? undefined : cleanText(input.postalCode, 'Postal code', 16),
        ageGroup: input.ageGroup === undefined ? undefined : parseChoice(input.ageGroup, AGE_GROUPS, 'age group'),
        ethnicity: input.ethnicity === undefined ? undefined : parseChoice(input.ethnicity, ETHNICITIES, 'ethnicity'),
        education: input.education === undefined ? undefined : parseChoice(input.education, EDUCATIONS, 'education'),
        relationship: input.relationship === undefined ? undefined : parseRelationship(input.relationship),
        notes: input.notes === undefined ? undefined : input.notes?.trim() || null,
        archivedAt: input.archived === undefined ? undefined : input.archived ? new Date() : null,
      },
      include: subjectInclude,
    });
  }

  static async remove(userId: string, id: string) {
    await this.get(userId, id);
    const sent = await prisma.scorecard.findFirst({
      where: { userId, subjectId: id, feedbackLinks: { some: {} } },
      select: { id: true },
    });
    if (sent) throw new ValidationError('This rating was sent and can no longer be changed.');
    await prisma.subject.delete({ where: { id } });
    return { id };
  }
}
