import prisma from '../config/database';
import { env } from '../config/env';
import { buildResult, DIMENSIONS, isScaleValue, PARAMETER_TO_DIMENSION } from '../data/catalog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { randomToken, sha256 } from '../utils/tokens';
import { MailService, shareSubject } from './mail.service';
import { scorecardEmail } from './scorecard-email';

type AnswerInput = { parameterId: string; value: number };

async function loadOwned(userId: string, scorecardId: string) {
  const scorecard = await prisma.scorecard.findFirst({
    where: { id: scorecardId, userId },
    include: {
      answers: true,
      dimensionScores: true,
      subject: true,
    },
  });
  if (!scorecard) throw new NotFoundError('Scorecard not found.');
  return scorecard;
}

const SENT_RATING = 'This rating was sent and can no longer be changed.';

async function assertNotSent(scorecardId: string) {
  const sent = await prisma.feedbackLink.count({ where: { scorecardId } });
  if (sent > 0) throw new ValidationError(SENT_RATING);
}

function answersMap(rows: { parameterId: string; value: number }[]): Record<string, number> {
  return Object.fromEntries(rows.map((row) => [row.parameterId, row.value]));
}

async function persistScores(scorecardId: string, answers: Record<string, number>) {
  const result = buildResult(answers);
  await prisma.scorecardDimensionScore.deleteMany({ where: { scorecardId } });
  if (result.dimensions.some((row) => row.filled > 0)) {
    await prisma.scorecardDimensionScore.createMany({
      data: result.dimensions
        .filter((row) => row.filled > 0)
        .map((row) => ({
          scorecardId,
          dimensionId: row.dimensionId,
          average: row.average,
          filled: row.filled,
        })),
    });
  }
  return prisma.scorecard.update({
    where: { id: scorecardId },
    data: {
      overall: result.answered === 0 ? null : result.overall,
      archetype: result.archetype,
      blurb: result.blurb,
      strongestDimension: result.strongestDimension,
      weakestDimension: result.weakestDimension,
      answeredCount: result.answered,
    },
    include: {
      answers: true,
      dimensionScores: true,
      subject: true,
    },
  });
}

export class ScorecardService {
  static async list(userId: string, subjectId?: string) {
    return prisma.scorecard.findMany({
      where: { userId, ...(subjectId ? { subjectId } : {}) },
      include: {
        subject: true,
        dimensionScores: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async get(userId: string, id: string) {
    return loadOwned(userId, id);
  }

  static async start(userId: string, subjectId: string, askToken?: string) {
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
    if (!subject) throw new NotFoundError('Person not found.');
    const sent = await prisma.scorecard.findFirst({
      where: { userId, subjectId, feedbackLinks: { some: {} } },
      select: { id: true },
    });
    if (sent) throw new ValidationError(SENT_RATING);
    const ratingRequestId = await this.claimAskToken(userId, askToken);
    const include = { answers: true, dimensionScores: true, subject: true } as const;
    if (ratingRequestId) {
      const linked = await prisma.scorecard.findUnique({
        where: { ratingRequestId },
        include,
      });
      if (linked) {
        if (linked.userId !== userId) throw new ValidationError('This request was sent to a different email address.');
        return linked;
      }
    }
    const draft = await prisma.scorecard.findFirst({
      where: { userId, subjectId, status: 'DRAFT' },
      include,
    });
    if (draft) {
      if (ratingRequestId && !draft.ratingRequestId) {
        return prisma.scorecard.update({
          where: { id: draft.id },
          data: { ratingRequestId },
          include,
        });
      }
      return draft;
    }
    return prisma.scorecard.create({
      data: { userId, subjectId, ratingRequestId },
      include,
    });
  }

  private static async claimAskToken(userId: string, askToken?: string) {
    const token = askToken?.trim();
    if (!token) return undefined;
    if (!/^[a-f0-9]{64}$/i.test(token)) throw new ValidationError('This request link is invalid.');
    const request = await prisma.ratingRequest.findUnique({ where: { tokenHash: sha256(token) } });
    if (!request) throw new ValidationError('This request link is invalid.');
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!me || me.email.toLowerCase() !== request.recipientEmail) {
      throw new ValidationError('Sign in with the email address this request was sent to.');
    }
    if (request.feedbackLinkId) throw new ValidationError('You already sent this rating.');
    return request.id;
  }

  static async saveAnswers(userId: string, scorecardId: string, answers: AnswerInput[]) {
    const scorecard = await loadOwned(userId, scorecardId);
    if (scorecard.status === 'COMPLETED') {
      throw new ValidationError('This scorecard is already complete.');
    }
    await assertNotSent(scorecardId);
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new ValidationError('answers must be a non-empty array.');
    }
    for (const answer of answers) {
      const dimensionId = PARAMETER_TO_DIMENSION[answer.parameterId];
      if (!dimensionId) throw new ValidationError(`Unknown parameter: ${answer.parameterId}`);
      if (!isScaleValue(answer.value)) throw new ValidationError('Each answer value must be 1–5.');
      await prisma.scorecardAnswer.upsert({
        where: { scorecardId_parameterId: { scorecardId, parameterId: answer.parameterId } },
        create: {
          scorecardId,
          parameterId: answer.parameterId,
          dimensionId,
          value: answer.value,
        },
        update: { value: answer.value, dimensionId },
      });
    }
    const latest = await prisma.scorecardAnswer.findMany({ where: { scorecardId } });
    return persistScores(scorecardId, answersMap(latest));
  }

  static async complete(userId: string, scorecardId: string, answers?: AnswerInput[]) {
    if (answers?.length) {
      await this.saveAnswers(userId, scorecardId, answers);
    }
    const scorecard = await loadOwned(userId, scorecardId);
    let completed = scorecard;
    if (scorecard.status !== 'COMPLETED') {
      if (scorecard.answers.length === 0) {
        throw new ValidationError('Add at least one answer before completing.');
      }
      const scored = await persistScores(scorecardId, answersMap(scorecard.answers));
      const row = await prisma.scorecard.update({
        where: { id: scorecardId },
        data: { status: 'COMPLETED', completedAt: new Date() },
        include: { answers: true, dimensionScores: true, subject: true },
      });
      completed = { ...row, overall: scored.overall, archetype: scored.archetype, blurb: scored.blurb };
    }
    await this.deliverRequest(userId, scorecardId);
    return completed;
  }

  private static async deliverRequest(userId: string, scorecardId: string) {
    const scorecard = await prisma.scorecard.findFirst({
      where: { id: scorecardId, userId, status: 'COMPLETED' },
      include: {
        dimensionScores: true,
        subject: true,
        user: { select: { displayName: true, email: true } },
        ratingRequest: { include: { requester: { select: { email: true, displayName: true } } } },
      },
    });
    const request = scorecard?.ratingRequest;
    if (!scorecard || !request || request.feedbackLinkId) return;
    const to = request.requester.email.trim().toLowerCase();
    const senderLabel = scorecard.user.displayName?.trim() || 'Colleague';
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const link = await prisma.feedbackLink.create({
      data: {
        scorecardId,
        recipientEmail: to,
        tokenHash: sha256(token),
        revealSender: true,
        senderLabel,
        expiresAt,
      },
    });
    await prisma.ratingRequest.update({
      where: { id: request.id },
      data: { feedbackLinkId: link.id },
    });
    const url = `${env.webAppUrl}/feedback/${token}`;
    const recipientName = request.requester.displayName?.replace(/\s+/g, ' ').trim() || null;
    const message = scorecardEmail({
      recipientName,
      overall: scorecard.overall,
      archetype: scorecard.archetype,
      blurb: scorecard.blurb,
      rows: scorecard.dimensionScores.map((row) => ({
        dimensionId: row.dimensionId,
        average: row.average,
      })),
      revealSender: true,
      senderLabel,
      url,
    });
    try {
      if (!MailService.configured()) {
        if (env.nodeEnv !== 'production') console.info('[rating-request] feedback ready', url);
        return;
      }
      await MailService.send({ to, subject: shareSubject(recipientName), text: message.text, html: message.html });
    } catch (error) {
      console.error('[rating-request] feedback email failed', error);
    }
  }

  static async remove(userId: string, id: string) {
    await this.get(userId, id);
    await assertNotSent(id);
    await prisma.scorecard.delete({ where: { id } });
    return { id };
  }

  static async setDimensions(userId: string, scorecardId: string, dimensionIds: unknown) {
    const scorecard = await loadOwned(userId, scorecardId);
    if (scorecard.status === 'COMPLETED') {
      throw new ValidationError('This scorecard is already complete.');
    }
    await assertNotSent(scorecardId);
    if (!Array.isArray(dimensionIds) || dimensionIds.length === 0) {
      throw new ValidationError('Choose at least one category.');
    }
    const allowed = new Set(DIMENSIONS.map((dimension) => dimension.id));
    const selected = DIMENSIONS.map((dimension) => dimension.id).filter(
      (id) => dimensionIds.includes(id) && allowed.has(id),
    );
    if (selected.length === 0) throw new ValidationError('Choose at least one category.');
    return prisma.scorecard.update({
      where: { id: scorecardId },
      data: { selectedDimensionIds: selected },
      include: { answers: true, dimensionScores: true, subject: true },
    });
  }

  static async share(userId: string, scorecardId: string, input: { to: string; channel?: string }) {
    const scorecard = await loadOwned(userId, scorecardId);
    if (scorecard.status !== 'COMPLETED') {
      throw new ValidationError('Finish the rating before sharing it.');
    }
    const to = input.to.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new ValidationError('Enter a valid email address.');
    }
    const revealSender = input.channel === 'self';
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, email: true },
    });
    const senderLabel = sender?.displayName?.trim() || sender?.email || null;
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.feedbackLink.create({
      data: {
        scorecardId,
        recipientEmail: to,
        tokenHash: sha256(token),
        revealSender,
        senderLabel: revealSender ? senderLabel : null,
        expiresAt,
      },
    });
    const url = `${env.webAppUrl}/feedback/${token}`;
    const recipientName = scorecard.subject?.displayName?.replace(/\s+/g, ' ').trim() || null;
    const subjectLine = shareSubject(recipientName);
    const message = scorecardEmail({
      recipientName,
      overall: scorecard.overall,
      archetype: scorecard.archetype,
      blurb: scorecard.blurb,
      rows: scorecard.dimensionScores.map((row) => ({
        dimensionId: row.dimensionId,
        average: row.average,
      })),
      revealSender,
      senderLabel,
      url,
    });

    if (revealSender) {
      return { sent: false as const, subject: subjectLine, body: message.text, url };
    }
    await MailService.send({ to, subject: subjectLine, text: message.text, html: message.html });
    return { sent: true as const, subject: subjectLine, body: message.text, url };
  }
}
