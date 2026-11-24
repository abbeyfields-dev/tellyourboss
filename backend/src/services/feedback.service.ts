import prisma from '../config/database';
import { env } from '../config/env';
import { NotFoundError, ValidationError } from '../utils/errors';
import { randomCode, randomToken, safeEqual, sha256 } from '../utils/tokens';
import { MailService } from './mail.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_ATTEMPT_LIMIT = 8;

async function loadLink(tokenRaw: string) {
  const token = tokenRaw.trim();
  if (!/^[a-f0-9]{64}$/i.test(token)) throw new NotFoundError('This link is invalid or has expired.');
  const link = await prisma.feedbackLink.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      scorecard: {
        include: {
          answers: true,
          subject: { select: { displayName: true, industry: true } },
          user: { select: { email: true } },
        },
      },
    },
  });
  if (!link || link.expiresAt < new Date()) {
    throw new NotFoundError('This link is invalid or has expired.');
  }
  return link;
}

export class FeedbackService {
  static async preview(token: string) {
    await loadLink(token);
    return { locked: true as const };
  }

  static async sendCode(token: string, emailRaw: string) {
    const link = await loadLink(token);
    const email = emailRaw.trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email !== link.recipientEmail) {
      throw new ValidationError('That email doesn’t match this feedback.');
    }
    const code = randomCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.feedbackLink.update({
      where: { id: link.id },
      data: { codeHash: sha256(`${link.id}:${code}`), codeExpiresAt, attempts: 0 },
    });
    const text = [
      'Your boss-o-rater feedback code is:',
      '',
      code,
      '',
      'It expires in 10 minutes. If you didn’t ask for it, you can ignore this email.',
    ].join('\n');
    if (!MailService.configured()) {
      if (env.nodeEnv === 'production') {
        console.error('[feedback] Email is not configured; unlock code was not sent');
        return { sent: true as const, devCode: undefined as string | undefined };
      }
      return { sent: true as const, devCode: code };
    }
    await MailService.send({ to: link.recipientEmail, subject: 'Your boss-o-rater feedback code', text });
    return { sent: true as const, devCode: undefined as string | undefined };
  }

  static async verify(token: string, codeRaw: string) {
    const link = await loadLink(token);
    const code = codeRaw.trim();
    if (!link.codeHash || !link.codeExpiresAt || link.codeExpiresAt < new Date()) {
      throw new ValidationError('Request a new code first.');
    }
    if (link.attempts >= CODE_ATTEMPT_LIMIT) {
      throw new ValidationError('Too many attempts. Request a new code.');
    }
    const matches = safeEqual(link.codeHash, sha256(`${link.id}:${code}`));
    if (!matches) {
      await prisma.feedbackLink.update({ where: { id: link.id }, data: { attempts: { increment: 1 } } });
      throw new ValidationError('That code doesn’t match.');
    }
    const viewToken = randomToken();
    const viewExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await prisma.feedbackLink.update({
      where: { id: link.id },
      data: {
        viewTokenHash: sha256(viewToken),
        viewExpiresAt,
        codeHash: null,
        codeExpiresAt: null,
        attempts: 0,
      },
    });
    return { viewToken };
  }

  static async details(token: string, viewTokenRaw: string) {
    const link = await loadLink(token);
    const viewToken = viewTokenRaw.trim();
    if (!viewToken || !link.viewTokenHash || !link.viewExpiresAt || link.viewExpiresAt < new Date()) {
      throw new ValidationError('Unlock this feedback again.');
    }
    if (!safeEqual(link.viewTokenHash, sha256(viewToken))) {
      throw new ValidationError('Unlock this feedback again.');
    }
    return {
      subjectName: link.scorecard.subject.displayName,
      industry: null,
      senderLabel: link.revealSender ? link.senderLabel : null,
      selectedDimensionIds: link.scorecard.selectedDimensionIds,
      overall: link.scorecard.overall,
      archetype: link.scorecard.archetype,
      blurb: link.scorecard.blurb,
      answers: link.scorecard.answers.map((answer) => ({
        parameterId: answer.parameterId,
        value: answer.value,
      })),
    };
  }

  static async reply(token: string, viewTokenRaw: string, messageRaw: string) {
    const link = await loadLink(token);
    const viewToken = viewTokenRaw.trim();
    if (!viewToken || !link.viewTokenHash || !link.viewExpiresAt || link.viewExpiresAt < new Date()) {
      throw new ValidationError('Unlock this feedback again.');
    }
    if (!safeEqual(link.viewTokenHash, sha256(viewToken))) {
      throw new ValidationError('Unlock this feedback again.');
    }
    if (link.revealSender) {
      throw new ValidationError('A private reply is only for anonymous feedback.');
    }
    const message = messageRaw.trim();
    if (message.length < 2 || message.length > 1000) {
      throw new ValidationError('Write a reply between 2 and 1000 characters.');
    }
    const text = [
      'Someone replied to the anonymous feedback you sent on boss-o-rater.',
      '',
      message,
      '',
      'Their email address is not included.',
    ].join('\n');
    if (!MailService.configured()) {
      if (env.nodeEnv === 'production') {
        console.error('[feedback] Email is not configured; anonymous reply was not sent');
        return { sent: true as const };
      }
      return { sent: true as const, devPreview: text };
    }
    await MailService.send({
      to: link.scorecard.user.email,
      subject: 'A reply to your anonymous boss-o-rater feedback',
      text,
    });
    return { sent: true as const };
  }

  static async inbox(emailRaw: string) {
    const email = emailRaw.trim().toLowerCase();
    const links = await prisma.feedbackLink.findMany({
      where: { recipientEmail: email },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        scorecard: {
          include: {
            answers: true,
            user: { select: { displayName: true } },
            subject: { select: { displayName: true } },
          },
        },
      },
    });
    return links.map((link) => ({
      id: link.id,
      createdAt: link.createdAt.toISOString(),
      blurb: link.scorecard.blurb,
      overall: link.scorecard.overall,
      archetype: link.scorecard.archetype,
      senderLabel: link.revealSender ? link.senderLabel || link.scorecard.user.displayName || 'Colleague' : null,
      subjectName: link.scorecard.subject.displayName,
      selectedDimensionIds: link.scorecard.selectedDimensionIds,
      answers: link.scorecard.answers.map((answer) => ({
        parameterId: answer.parameterId,
        value: answer.value,
      })),
    }));
  }
}
