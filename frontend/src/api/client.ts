import type { InsightInput } from '../data/profile';
import type {
  AuthPayload,
  AuthUser,
  Gender,
  InboxItem,
  RatingRequestItem,
  Relationship,
  ScorecardDetail,
  SubjectSummary,
} from './types';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://bossorater-api-250596915890.us-central1.run.app';

type ApiSuccess<T> = { success: true; data: T; message?: string };
type ApiFailure = { success: false; error: string };

function readError(status: number, text: string): string {
  const trimmed = text.trim();
  if (/rate exceeded/i.test(trimmed) || status === 429) {
    return 'The server is busy. Wait a few seconds and try again.';
  }
  if (!trimmed) return `Request failed (${status})`;
  return trimmed.length > 140 ? `Request failed (${status})` : trimmed;
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const text = await response.text();
  let body: ApiSuccess<T> | ApiFailure;
  try {
    body = JSON.parse(text) as ApiSuccess<T> | ApiFailure;
  } catch {
    throw new Error(readError(response.status, text));
  }
  if (!response.ok || !('success' in body) || !body.success) {
    throw new Error(!body.success ? body.error : `Request failed (${response.status})`);
  }
  return body.data;
}

export function isAuthFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  return /invalid token|user not found|no token provided|invalid or expired refresh|invalid refresh/i.test(
    message,
  );
}

export const api = {
  register: (email: string, password: string, displayName?: string) =>
    request<AuthPayload>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),
  login: (email: string, password: string) =>
    request<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: (refreshToken: string) =>
    request<unknown>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string; expiresIn: string }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  forgotPassword: (email: string) =>
    request<{ sent: true; devResetUrl?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ reset: true }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  updateProfile: (token: string, body: InsightInput) =>
    request<AuthUser>('/api/auth/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify({ ...body, gender: body.gender ?? 'UNSPECIFIED' }),
    }),
  listSubjects: (token: string) => request<SubjectSummary[]>('/api/subjects', { token }),
  createSubject: (
    token: string,
    body: {
      displayName: string;
      roleTitle?: string;
      company?: string;
      industry?: string;
      gender?: Gender | null;
      relationship?: Relationship;
    },
  ) =>
    request<SubjectSummary>('/api/subjects', {
      method: 'POST',
      token,
      body: JSON.stringify({ ...body, gender: body.gender ?? 'UNSPECIFIED' }),
    }),
  updateSubject: (token: string, subjectId: string, body: InsightInput) =>
    request<SubjectSummary>(`/api/subjects/${subjectId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ ...body, gender: body.gender ?? 'UNSPECIFIED' }),
    }),
  getScorecard: (token: string, scorecardId: string) =>
    request<ScorecardDetail>(`/api/scorecards/${scorecardId}`, { token }),
  startScorecard: (token: string, subjectId: string, askToken?: string) =>
    request<ScorecardDetail>('/api/scorecards', {
      method: 'POST',
      token,
      body: JSON.stringify({ subjectId, ...(askToken ? { askToken } : {}) }),
    }),
  deleteScorecard: (token: string, scorecardId: string) =>
    request<{ id: string }>(`/api/scorecards/${scorecardId}`, { method: 'DELETE', token }),
  deleteSubject: (token: string, subjectId: string) =>
    request<{ id: string }>(`/api/subjects/${subjectId}`, { method: 'DELETE', token }),
  saveAnswers: (token: string, scorecardId: string, answers: { parameterId: string; value: number }[]) =>
    request(`/api/scorecards/${scorecardId}/answers`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ answers }),
    }),
  completeScorecard: (
    token: string,
    scorecardId: string,
    answers?: { parameterId: string; value: number }[],
  ) =>
    request(`/api/scorecards/${scorecardId}/complete`, {
      method: 'POST',
      token,
      body: JSON.stringify(answers?.length ? { answers } : {}),
    }),
  setDimensions: (token: string, scorecardId: string, dimensionIds: string[]) =>
    request<ScorecardDetail>(`/api/scorecards/${scorecardId}/dimensions`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ dimensionIds }),
    }),
  shareScorecard: (
    token: string,
    scorecardId: string,
    body: { to: string; channel: 'self' | 'anonymous' },
  ) =>
    request<{ sent: boolean; subject: string; body: string; url: string }>(`/api/scorecards/${scorecardId}/share`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  feedbackPreview: (token: string) => request<{ locked: true }>(`/api/feedback/${token}`),
  feedbackCode: (token: string, email: string) =>
    request<{ sent: true; devCode?: string }>(`/api/feedback/${token}/code`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  feedbackVerify: (token: string, code: string) =>
    request<{ viewToken: string }>(`/api/feedback/${token}/verify`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  feedbackDetails: (token: string, viewToken: string) =>
    request<{
      subjectName: string;
      industry: string | null;
      senderLabel: string | null;
      selectedDimensionIds: string[];
      overall: number | null;
      archetype: string | null;
      blurb: string | null;
      answers: { parameterId: string; value: number }[];
    }>(`/api/feedback/${token}/details`, {
      headers: { 'x-feedback-view': viewToken },
    }),
  feedbackReply: (token: string, viewToken: string, message: string) =>
    request<{ sent: true }>(`/api/feedback/${token}/reply`, {
      method: 'POST',
      headers: { 'x-feedback-view': viewToken },
      body: JSON.stringify({ message }),
    }),
  inbox: (token: string) => request<InboxItem[]>('/api/feedback/inbox', { token }),
  ratingRequests: (token: string) => request<RatingRequestItem[]>('/api/auth/rating-requests', { token }),
  openRatingRequest: (token: string, askToken: string) =>
    request<{ requesterName: string }>(`/api/auth/rating-request/open?token=${encodeURIComponent(askToken)}`, {
      token,
    }),
  requestRating: (token: string, to: string) =>
    request<{ sent: true }>(`/api/auth/rating-request`, {
      method: 'POST',
      token,
      body: JSON.stringify({ to }),
    }),
};
