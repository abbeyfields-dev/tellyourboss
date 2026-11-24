import bcrypt from 'bcrypt';
import type { Gender } from '@prisma/client';
import jwt, { type SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { AGE_GROUPS, EDUCATIONS, ETHNICITIES, cleanText, parseChoice } from '../data/insights';
import { MailService } from './mail.service';
import { randomToken, sha256 } from '../utils/tokens';

const GENDERS: Gender[] = ['WOMAN', 'MAN', 'NONBINARY', 'PREFER_NOT_TO_SAY', 'UNSPECIFIED'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = {
  id: true,
  email: true,
  displayName: true,
  industry: true,
  gender: true,
  country: true,
  location: true,
  state: true,
  postalCode: true,
  ageGroup: true,
  ethnicity: true,
  education: true,
  createdAt: true,
  updatedAt: true,
} as const;

function parseGender(value: unknown): Gender {
  if (value == null || value === '') return 'UNSPECIFIED';
  if (typeof value !== 'string' || !GENDERS.includes(value as Gender)) {
    throw new ValidationError('Choose a gender, or leave it unset.');
  }
  return value as Gender;
}

export class AuthService {
  private static generateTokens(userId: string, email: string, tokenVersion = 0) {
    const accessToken = jwt.sign({ userId, email, tokenVersion }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as SignOptions);
    const refreshToken = jwt.sign({ userId, email, type: 'refresh' }, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn,
    } as SignOptions);
    return { accessToken, refreshToken, expiresIn: env.jwtExpiresIn };
  }

  private static async saveRefreshToken(userId: string, token: string) {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  }

  static async register(emailRaw: string, password: string, displayName?: string) {
    const email = emailRaw.toLowerCase().trim();
    if (!EMAIL_RE.test(email) || password.length < 8) {
      throw new ValidationError('Use a valid email and a password of at least 8 characters.');
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ValidationError('This email is already registered.');
    }
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        displayName: displayName?.trim() || null,
      },
      select: publicUser,
    });
    const tokens = this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user, ...tokens };
  }

  static async login(emailRaw: string, password: string) {
    const email = emailRaw.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { ...publicUser, password: true, tokenVersion: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AuthenticationError('Invalid email or password.');
    }
    const tokens = this.generateTokens(user.id, user.email, user.tokenVersion);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        industry: user.industry,
        gender: user.gender,
        country: user.country,
        location: user.location,
        state: user.state,
        postalCode: user.postalCode,
        ageGroup: user.ageGroup,
        ethnicity: user.ethnicity,
        education: user.education,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      ...tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, email: true, tokenVersion: true } } },
    });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => undefined);
      throw new AuthenticationError('Invalid or expired refresh token.');
    }
    try {
      jwt.verify(refreshToken, env.jwtRefreshSecret);
    } catch {
      await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => undefined);
      throw new AuthenticationError('Invalid refresh token.');
    }
    const tokens = this.generateTokens(stored.user.id, stored.user.email, stored.user.tokenVersion);
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await this.saveRefreshToken(stored.user.id, tokens.refreshToken);
    return tokens;
  }

  static async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  static async updateProfile(
    userId: string,
    input: {
      displayName?: string;
      industry?: string | null;
      gender?: unknown;
      country?: unknown;
      location?: unknown;
      state?: unknown;
      postalCode?: unknown;
      ageGroup?: unknown;
      ethnicity?: unknown;
      education?: unknown;
    },
  ) {
    const displayName = input.displayName?.trim();
    if (input.displayName !== undefined && !displayName) {
      throw new ValidationError('Name is required.');
    }
    return prisma.user.update({
      where: { id: userId },
      data: {
        displayName: input.displayName === undefined ? undefined : displayName,
        industry: input.industry === undefined ? undefined : cleanText(input.industry, 'Industry'),
        gender: input.gender === undefined ? undefined : parseGender(input.gender),
        country: input.country === undefined ? undefined : cleanText(input.country, 'Country'),
        location: input.location === undefined ? undefined : cleanText(input.location, 'Location'),
        state: input.state === undefined ? undefined : cleanText(input.state, 'State'),
        postalCode: input.postalCode === undefined ? undefined : cleanText(input.postalCode, 'Postal code', 16),
        ageGroup: input.ageGroup === undefined ? undefined : parseChoice(input.ageGroup, AGE_GROUPS, 'age group'),
        ethnicity: input.ethnicity === undefined ? undefined : parseChoice(input.ethnicity, ETHNICITIES, 'ethnicity'),
        education: input.education === undefined ? undefined : parseChoice(input.education, EDUCATIONS, 'education'),
      },
      select: publicUser,
    });
  }

  static async requestPasswordReset(emailRaw: string) {
    const email = emailRaw.toLowerCase().trim();
    const generic = { sent: true as const, devResetUrl: undefined as string | undefined };
    if (!EMAIL_RE.test(email)) return generic;
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
    if (!user) return generic;

    const token = randomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordReset.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash: sha256(token), expiresAt },
    });
    const resetUrl = `${env.webAppUrl}/?reset=${token}`;
    const text = [
      'Reset your boss-o-rater password.',
      '',
      'This link works for one hour:',
      resetUrl,
      '',
      'If you didn’t ask for this, you can ignore the email.',
    ].join('\n');

    if (!MailService.configured()) {
      if (env.nodeEnv === 'production') {
        console.error('[auth] Email is not configured; password reset email was not sent');
        return generic;
      }
      return { sent: true as const, devResetUrl: resetUrl };
    }
    await MailService.send({ to: user.email, subject: 'Reset your boss-o-rater password', text });
    return generic;
  }

  static async resetPassword(tokenRaw: string, password: string) {
    const token = tokenRaw.trim();
    if (!token || password.length < 8) {
      throw new ValidationError('Use the reset link and a password of at least 8 characters.');
    }
    const row = await prisma.passwordReset.findUnique({ where: { tokenHash: sha256(token) } });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new ValidationError('This reset link is invalid or has expired.');
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { password: await bcrypt.hash(password, 10), tokenVersion: { increment: 1 } },
      }),
      prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.deleteMany({ where: { userId: row.userId } }),
    ]);
    return { reset: true as const };
  }

  static async requestRating(userId: string, toRaw: string) {
    const to = toRaw.trim().toLowerCase();
    if (!EMAIL_RE.test(to)) throw new ValidationError('Enter a valid email address.');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true },
    });
    if (!user) throw new ValidationError('Sign in again to send a request.');
    if (user.email.toLowerCase() === to) {
      throw new ValidationError('Enter someone else’s email address.');
    }
    const who = user.displayName?.trim() || 'Someone';
    const token = randomToken();
    await prisma.ratingRequest.create({
      data: { requesterId: userId, recipientEmail: to, tokenHash: sha256(token) },
    });
    const url = `${env.webAppUrl}/?ask=${token}`;
    const text = [
      `${who} asked you to rate them on boss-o-rater.`,
      '',
      'Open this link to start. It works for the email address this message was sent to:',
      url,
      '',
      'This message does not include their email address.',
    ].join('\n');
    if (!MailService.configured()) {
      if (env.nodeEnv === 'production') {
        console.error('[auth] Email is not configured; rating request was not sent');
        return { sent: true as const };
      }
      return { sent: true as const, devPreview: text };
    }
    await MailService.send({ to, subject: `${who} asked you to rate them on boss-o-rater`, text });
    return { sent: true as const };
  }

  static async listRatingRequests(userId: string) {
    const rows = await prisma.ratingRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, recipientEmail: true, createdAt: true, feedbackLinkId: true },
    });
    return rows.map((row) => ({
      id: row.id,
      recipientEmail: row.recipientEmail,
      createdAt: row.createdAt.toISOString(),
      status: row.feedbackLinkId ? ('received' as const) : ('waiting' as const),
      feedbackId: row.feedbackLinkId,
    }));
  }

  static async openRatingRequest(userId: string, tokenRaw: string) {
    const token = tokenRaw.trim();
    if (!/^[a-f0-9]{64}$/i.test(token)) throw new ValidationError('This request link is invalid.');
    const request = await prisma.ratingRequest.findUnique({
      where: { tokenHash: sha256(token) },
      include: { requester: { select: { displayName: true } } },
    });
    if (!request) throw new ValidationError('This request link is invalid.');
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!me || me.email.toLowerCase() !== request.recipientEmail) {
      throw new ValidationError('Sign in with the email address this request was sent to.');
    }
    if (request.feedbackLinkId) throw new ValidationError('You already sent this rating.');
    return { requesterName: request.requester.displayName?.trim() || 'Someone' };
  }
}
