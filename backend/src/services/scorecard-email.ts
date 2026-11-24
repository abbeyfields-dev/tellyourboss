import { DIMENSIONS } from '../data/catalog';
import { OPINION_DISCLAIMER } from './mail.service';

type ScoreRow = { dimensionId: string; average: number };

type ScorecardEmailInput = {
  recipientName: string | null;
  overall: number | null;
  archetype: string | null;
  blurb: string | null;
  rows: ScoreRow[];
  revealSender: boolean;
  senderLabel: string | null;
  url: string;
};

const SHORT_TITLES: Record<string, string> = {
  leadership: 'Leadership',
  communication: 'Communication',
  feedback: 'Feedback',
  personality: 'Personality',
  innovation: 'Innovation',
  growth: 'Growth',
  shielding: 'Shielding',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scoreText(value: number): string {
  return value.toFixed(1);
}

function barColor(value: number): string {
  if (value >= 4.2) return '#0050E2';
  if (value >= 3.2) return '#17B3C6';
  if (value >= 2.4) return '#8B6CF0';
  return '#14213D';
}

function matchLabel(overall: number): string {
  if (overall >= 4.2) return 'Strong match';
  if (overall >= 3.2) return 'Workable match';
  if (overall >= 2.4) return 'Mixed match';
  return 'Strained match';
}

function orderedRows(rows: ScoreRow[]): { title: string; average: number }[] {
  const byId = new Map(rows.map((row) => [row.dimensionId, row.average]));
  return DIMENSIONS.flatMap((dimension) => {
    const average = byId.get(dimension.id);
    if (average == null) return [];
    return [{ title: SHORT_TITLES[dimension.id] ?? dimension.title, average }];
  });
}

export function scorecardEmail(input: ScorecardEmailInput): { text: string; html: string } {
  const name = input.recipientName?.replace(/\s+/g, ' ').trim() || null;
  const greeting = name ? `Hello ${name},` : 'Hello,';
  const lead =
    input.revealSender && input.senderLabel
      ? `${input.senderLabel} rated you on boss-o-rater.`
      : 'Someone rated you on boss-o-rater.';
  const overall = input.overall ?? 0;
  const headline = input.overall == null ? 'Your scorecard is ready' : `${scoreText(overall)} / 5 · ${matchLabel(overall)}`;
  const rows = orderedRows(input.rows);
  const scoreLines = rows.map((row) => `${row.title.padEnd(16, ' ')} ${scoreText(row.average)}`);
  const text = [
    greeting,
    '',
    `${lead} Here is the snapshot.`,
    '',
    headline,
    ...(input.blurb ? [input.blurb, ''] : ['']),
    ...scoreLines,
    '',
    `See the full scorecard: ${input.url}`,
    '',
    'This link is from bossorater.com. You will confirm this email address before the detail opens.',
    ...(input.revealSender
      ? []
      : ['', 'This email was sent anonymously. The sender’s name and email address are not included.']),
    '',
    OPINION_DISCLAIMER,
  ].join('\n');

  const bars = rows
    .map((row) => {
      const width = Math.max(8, Math.round((row.average / 5) * 160));
      const rest = 160 - width;
      const color = barColor(row.average);
      return `<tr>
        <td style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#14213D;">${escapeHtml(row.title)}</td>
        <td width="168" style="padding:7px 8px;">
          <table role="presentation" width="160" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="${width}" height="12" bgcolor="${color}" style="font-size:0;line-height:0;">&nbsp;</td>
              <td width="${rest}" height="12" bgcolor="#E5E9F3" style="font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
        <td align="right" style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#14213D;">${scoreText(row.average)}</td>
      </tr>`;
    })
    .join('');

  const anonymous = input.revealSender
    ? ''
    : `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#5C6A86;">This email was sent anonymously. The sender’s name and email address are not included.</p>`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F6F7FB;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(headline)}. Open the card to see how the categories line up.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F7FB;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;">
          <tr>
            <td style="background:#14213D;padding:28px 24px;border-radius:16px 16px 0 0;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;color:#94B4F1;font-weight:bold;">BOSS-O-RATER</p>
              <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:32px;color:#ffffff;font-weight:bold;">${escapeHtml(headline)}</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#d5dbe8;">${escapeHtml(input.blurb || lead)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#14213D;">${escapeHtml(greeting)}</p>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#14213D;">${escapeHtml(lead)} Here is how the ratings line up.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
                ${bars}
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
                <tr>
                  <td bgcolor="#0050E2" style="border-radius:10px;">
                    <a href="${escapeHtml(input.url)}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">See the full scorecard</a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#5C6A86;">This link is from bossorater.com. You will confirm this email address before the detail opens.</p>
              ${anonymous}
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8E98B0;">${escapeHtml(OPINION_DISCLAIMER)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { text, html };
}
