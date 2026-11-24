import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { ServiceUnavailableError, ValidationError } from '../utils/errors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SHARE_SUBJECT = 'Someone rated you on boss-o-rater.';

export function shareSubject(name?: string | null): string {
  const who = name?.replace(/\s+/g, ' ').trim();
  if (!who) return SHARE_SUBJECT;
  return `${who.slice(0, 80)}, someone rated you on boss-o-rater.`.slice(0, 160);
}
export const OPINION_DISCLAIMER =
  'This feedback reflects the sender’s opinion, not boss-o-rater’s.';

function isConfigured(): boolean {
  return Boolean(env.resendApiKey || (env.smtpHost && env.smtpUser && env.smtpPass));
}

async function sendWithResend(input: { to: string; subject: string; text: string; html?: string }): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.mailFrom,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      reply_to: env.mailFrom,
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    console.error('[mail] Resend rejected the message', response.status, detail);
    throw new ServiceUnavailableError('Email could not be sent.');
  }
}

export class MailService {
  static configured(): boolean {
    return isConfigured();
  }

  static async send(input: { to: string; subject: string; text: string; html?: string }): Promise<void> {
    const to = input.to.trim().toLowerCase();
    const subject = input.subject.trim();
    const text = input.text.trim();
    const html = input.html?.trim();
    if (!EMAIL_RE.test(to)) throw new ValidationError('Enter a valid email address.');
    if (!subject || subject.length > 160) throw new ValidationError('Subject must be 1–160 characters.');
    if (!text || text.length > 8000) throw new ValidationError('Message must be 1–8000 characters.');
    if (html && html.length > 60000) throw new ValidationError('Email layout is too large.');
    if (!isConfigured()) {
      throw new ServiceUnavailableError('Email is not set up yet.');
    }
    if (env.resendApiKey) {
      await sendWithResend({ to, subject, text, html });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });

    await transporter.sendMail({
      from: env.mailFrom,
      to,
      subject,
      text,
      html,
      replyTo: env.mailFrom,
    });
  }
}
