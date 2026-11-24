import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, isAuthFailure } from '../api/client';
import {
  latestCompleted,
  latestDraft,
  personStatus,
  type AuthPayload,
  type InboxItem,
  type RatingRequestItem,
  type SubjectSummary,
} from '../api/types';
import { GameHud } from '../components/GameHud';
import { RecapPanel } from '../components/RecapPanel';
import { ResultsPanel } from '../components/ResultsPanel';
import { ScaleOptionList } from '../components/ScaleOptionList';
import { SplashScreen } from '../components/SplashScreen';
import { WelcomeOnboarding } from '../components/WelcomeOnboarding';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { HomeDashboard } from '../components/HomeDashboard';
import { ManagerSelect } from '../components/ManagerSelect';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { AccountSheet } from '../components/AccountSheet';
import { AskRatingSheet } from '../components/AskRatingSheet';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { MePanel } from '../components/MePanel';
import { ProfileSheet } from '../components/ProfileSheet';
import { BottomNav, type AppTab } from '../components/BottomNav';
import {
  countQuestions,
  dimensionStartIn,
  dimensionsByIds,
  firstUnansweredIn,
  getQuestionFrom,
  isLastInDimension,
  lastCompletedIn,
  type ScaleValue,
} from '../data/dimensions';
import {
  answersFromScorecard,
  buildResult,
  categoryComment,
  scorecardMailto,
  scoreDimension,
  type Answers,
  type QuizResult,
} from '../data/score';
import type { Gender, InsightInput } from '../data/profile';
import { genderLabel } from '../data/profile';
import { AuthScreen } from './AuthScreen';
import { clearSession, restoreSession, saveSession, type Session } from '../state/authStore';
import { APP_NAME } from '../brand';
import { theme, type } from '../theme';

type Step = 'auth' | 'welcome' | 'intro' | 'question' | 'recap' | 'results';

const ONBOARD_KEY = '@bossorater/onboarded-v1';
const AUTO_ADVANCE_KEY = '@bossorater/auto-advance-v1';
const SEEN_KEY = '@bossorater/inbox-seen-v1';
const REQUESTS_KEY = '@bossorater/rating-requests-v1';

function passwordResetToken(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return '';
  return new URLSearchParams(window.location.search).get('reset') ?? '';
}

function askToken(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return '';
  return new URLSearchParams(window.location.search).get('ask') ?? '';
}

function clearAskToken(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('ask')) return;
  url.searchParams.delete('ask');
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, '', next);
}

export function TellYourBossScreen(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [subject, setSubject] = useState<SubjectSummary | null>(null);
  const [scorecardId, setScorecardId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('auth');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [recapDimensionIndex, setRecapDimensionIndex] = useState(0);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [viewingSaved, setViewingSaved] = useState(false);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [requests, setRequests] = useState<RatingRequestItem[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [inboxFocus, setInboxFocus] = useState<string | null>(null);
  const [choosingPerson, setChoosingPerson] = useState(false);
  const [tab, setTab] = useState<AppTab>('home');
  const [dimensionIds, setDimensionIds] = useState<string[]>([]);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [profileSubject, setProfileSubject] = useState<SubjectSummary | null>(null);
  const [lastScorecard, setLastScorecard] = useState<{
    result: QuizResult;
    subjectName: string | null;
    saved: boolean;
  } | null>(null);
  const insets = useSafeAreaInsets();
  const navSpace = 74 + Math.max(insets.bottom, 10);

  const pendingAnswers = useRef<{ parameterId: string; value: number }[]>([]);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(session);
  const scorecardIdRef = useRef(scorecardId);
  const claimedAsk = useRef<string | null>(null);
  sessionRef.current = session;
  scorecardIdRef.current = scorecardId;

  const refreshSubjects = useCallback(async (token: string) => {
    setSubjects(await api.listSubjects(token));
  }, []);

  const flushAnswers = useCallback(async () => {
    const token = sessionRef.current?.accessToken;
    const id = scorecardIdRef.current;
    const payload = pendingAnswers.current;
    if (!token || !id || payload.length === 0) return;
    pendingAnswers.current = [];
    await api.saveAnswers(token, id, payload);
  }, []);

  const queueAnswer = useCallback((parameterId: string, value: ScaleValue) => {
    pendingAnswers.current = [
      ...pendingAnswers.current.filter((row) => row.parameterId !== parameterId),
      { parameterId, value },
    ];
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [seen, auto] = await Promise.all([
        AsyncStorage.getItem(ONBOARD_KEY),
        AsyncStorage.getItem(AUTO_ADVANCE_KEY),
      ]);
      const resetting = Boolean(passwordResetToken());
      const asking = Boolean(askToken());
      setAutoAdvance(auto === '1');
      const restored = await restoreSession();
      if (cancelled) return;
      setOnboarded(seen === '1' || restored != null || resetting || asking);
      if (restored && !resetting) {
        try {
          let nextSession = restored;
          try {
            await refreshSubjects(restored.accessToken);
          } catch (error) {
            if (!isAuthFailure(error)) throw error;
            const tokens = await api.refresh(restored.refreshToken);
            nextSession = {
              ...restored,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            };
            await saveSession(nextSession);
            await refreshSubjects(nextSession.accessToken);
          }
          if (cancelled) return;
          setSession(nextSession);
          setStep('welcome');
        } catch {
          await clearSession();
          if (cancelled) return;
          setSession(null);
          setStep('auth');
        }
      } else {
        setStep('auth');
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSubjects]);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(SEEN_KEY).then((raw) => {
      if (cancelled || !raw) return;
      try {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) setSeenIds(parsed.filter((id) => typeof id === 'string'));
      } catch {
        // Ignore a bad saved list.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setInbox([]);
      setRequests([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const saved = await AsyncStorage.getItem(REQUESTS_KEY).catch(() => null);
      if (!cancelled && saved) {
        try {
          const parsed = JSON.parse(saved) as RatingRequestItem[];
          if (Array.isArray(parsed)) setRequests(parsed);
        } catch {
          // Ignore a bad saved list.
        }
      }
      const [inboxResult, requestResult] = await Promise.allSettled([
        api.inbox(session.accessToken),
        api.ratingRequests(session.accessToken),
      ]);
      if (cancelled) return;
      if (inboxResult.status === 'fulfilled') setInbox(inboxResult.value);
      if (requestResult.status === 'fulfilled') {
        setRequests(requestResult.value);
        void AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(requestResult.value));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, tab]);

  const markSeen = useCallback((id: string) => {
    setSeenIds((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      void AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const onAuthenticated = useCallback(
    async (payload: AuthPayload) => {
      const next: Session = {
        user: payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
      };
      await saveSession(next);
      setSession(next);
      setStep('welcome');
      setTab('home');
      setLobbyError(null);
      await refreshSubjects(next.accessToken);
    },
    [refreshSubjects],
  );

  const signOut = useCallback(async () => {
    const refreshToken = sessionRef.current?.refreshToken;
    if (refreshToken) {
      void api.logout(refreshToken).catch(() => undefined);
    }
    await clearSession();
    pendingAnswers.current = [];
    setAccountOpen(false);
    setChoosingPerson(false);
    claimedAsk.current = null;
    setSession(null);
    setSubjects([]);
    setRequests([]);
    setSubject(null);
    setScorecardId(null);
    setResult(null);
    setTab('home');
    setStep('auth');
  }, []);

  const patchLocalDraft = useCallback(
    (targetId: string, cardId: string, nextAnswers: Answers) => {
      const answered = Object.keys(nextAnswers).length;
      const now = new Date().toISOString();
      setSubjects((current) =>
        current.map((row) => {
          if (row.id !== targetId) return row;
          const draft = {
            id: cardId,
            status: 'DRAFT' as const,
            overall: null,
            archetype: null,
            answeredCount: answered,
            completedAt: null,
            updatedAt: now,
          };
          return {
            ...row,
            scorecards: [draft, ...row.scorecards.filter((card) => card.id !== cardId)],
            _count: { scorecards: Math.max(row._count.scorecards, 1) },
          };
        }),
      );
    },
    [],
  );

  const patchLocalCompleted = useCallback(
    (targetId: string, cardId: string, nextResult: QuizResult) => {
      const now = new Date().toISOString();
      setSubjects((current) =>
        current.map((row) => {
          if (row.id !== targetId) return row;
          const completed = {
            id: cardId,
            status: 'COMPLETED' as const,
            overall: nextResult.overall,
            archetype: nextResult.archetype,
            answeredCount: nextResult.answered,
            completedAt: now,
            updatedAt: now,
          };
          return {
            ...row,
            scorecards: [
              completed,
              ...row.scorecards.filter((card) => card.id !== cardId && card.status !== 'DRAFT'),
            ],
            _count: { scorecards: Math.max(row._count.scorecards, 1) },
          };
        }),
      );
    },
    [],
  );

  const resetFlow = useCallback((nextTab: AppTab = 'home') => {
    const token = sessionRef.current?.accessToken;
    const cardId = scorecardIdRef.current;
    if (token && cardId && pendingAnswers.current.length > 0) {
      void flushAnswers().catch(() => undefined);
    }
    if (subject && cardId && !viewingSaved && Object.keys(answers).length > 0 && !result) {
      patchLocalDraft(subject.id, cardId, answers);
    }
    const destination: AppTab =
      nextTab === 'rate' || nextTab === 'feedback' || nextTab === 'me' ? nextTab : 'home';
    setStep('welcome');
    setTab(destination);
    setChoosingPerson(false);
    setIndex(0);
    setAnswers({});
    setResult(null);
    setRecapDimensionIndex(0);
    setShareHint(null);
    setShareOpen(false);
    setLeaveOpen(false);
    setViewingSaved(false);
    setSubject(null);
    setScorecardId(null);
  }, [answers, flushAnswers, patchLocalDraft, result, subject, viewingSaved]);

  const finishQuiz = useCallback(
    async (nextAnswers: Answers) => {
      const nextResult = buildResult(nextAnswers, dimensionIds);
      setResult(nextResult);
      setLastScorecard({
        result: nextResult,
        subjectName: subject?.displayName ?? null,
        saved: false,
      });
      setStep('results');
      pendingAnswers.current = [];
      if (session && scorecardId) {
        const payload = Object.entries(nextAnswers).map(([parameterId, value]) => ({ parameterId, value }));
        try {
          await api.completeScorecard(session.accessToken, scorecardId, payload);
          if (subject) patchLocalCompleted(subject.id, scorecardId, nextResult);
        } catch {
          setShareHint('Scorecard unlocked locally. Sync failed — try again later.');
        }
      }
    },
    [dimensionIds, patchLocalCompleted, scorecardId, session, subject],
  );

  const activeDimensions = dimensionsByIds(dimensionIds);
  const activeCount = countQuestions(activeDimensions);

  const advanceFrom = useCallback(
    (nextAnswers: Answers, fromIndex: number) => {
      const dims = dimensionsByIds(dimensionIds);
      const total = countQuestions(dims);
      const current = getQuestionFrom(dims, fromIndex);
      if (!current || nextAnswers[current.parameter.id] == null) return;
      if (fromIndex === total - 1) {
        void finishQuiz(nextAnswers);
        return;
      }
      if (isLastInDimension(current)) {
        void flushAnswers().catch(() => undefined);
        setRecapDimensionIndex(current.dimensionIndex);
        setStep('recap');
        return;
      }
      setIndex(fromIndex + 1);
    },
    [dimensionIds, finishQuiz, flushAnswers],
  );

  const selectValue = useCallback(
    (value: ScaleValue) => {
      const current = getQuestionFrom(activeDimensions, index);
      if (!current) return;
      const nextAnswers = { ...answers, [current.parameter.id]: value };
      setAnswers(nextAnswers);
      queueAnswer(current.parameter.id, value);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (autoAdvance) {
        advanceTimer.current = setTimeout(() => {
          advanceTimer.current = null;
          advanceFrom(nextAnswers, index);
        }, 280);
      }
    },
    [activeDimensions, advanceFrom, answers, autoAdvance, index, queueAnswer],
  );

  const advanceQuestion = useCallback(() => {
    advanceFrom(answers, index);
  }, [advanceFrom, answers, index]);

  const startCampaign = useCallback(
    async (target: SubjectSummary, askToken?: string) => {
      if (!session) return false;
      setBusy(true);
      setLobbyError(null);
      try {
        const card = await api.startScorecard(session.accessToken, target.id, askToken);
        const nextAnswers = answersFromScorecard(card.answers ?? []);
        const selected = card.selectedDimensionIds ?? [];
        const dims = dimensionsByIds(selected);
        const total = countQuestions(dims);
        const resumeAt = firstUnansweredIn(dims, nextAnswers);
        setDimensionIds(selected);
        setSubject(target);
        setScorecardId(card.id);
        setAnswers(nextAnswers);
        setResult(null);
        setViewingSaved(false);
        setShareHint(null);
        if (resumeAt >= total && Object.keys(nextAnswers).length > 0) {
          const nextResult = buildResult(nextAnswers, selected);
          setResult(nextResult);
          setLastScorecard({ result: nextResult, subjectName: target.displayName, saved: false });
          setStep('results');
          try {
            await api.completeScorecard(session.accessToken, card.id);
            patchLocalCompleted(target.id, card.id, nextResult);
          } catch {
            setShareHint('Scorecard unlocked locally. Sync failed — try again later.');
          }
        } else {
          setIndex(resumeAt);
          setChoosingPerson(false);
          setStep(selected.length > 0 ? 'question' : 'intro');
        }
      } catch (error) {
        if (isAuthFailure(error)) {
          await signOut();
          return false;
        }
        setLobbyError(error instanceof Error ? error.message : 'Could not start the rating.');
        return false;
      } finally {
        setBusy(false);
      }
      return true;
    },
    [patchLocalCompleted, session, signOut],
  );

  const claimAsk = useCallback(
    async (current: Session) => {
      const token = askToken();
      if (!token || claimedAsk.current === `${current.user.id}:${token}`) return;
      claimedAsk.current = `${current.user.id}:${token}`;
      try {
        const preview = await api.openRatingRequest(current.accessToken, token);
        const people = await api.listSubjects(current.accessToken);
        const name = preview.requesterName.trim();
        const person =
          people.find((row) => row.displayName.trim().toLowerCase() === name.toLowerCase()) ??
          (await api.createSubject(current.accessToken, { displayName: name }));
        setSubjects((existing) => [person, ...existing.filter((row) => row.id !== person.id)]);
        const started = await startCampaign(person, token);
        if (!started) {
          claimedAsk.current = null;
          return;
        }
        clearAskToken();
      } catch (error) {
        claimedAsk.current = null;
        setLobbyError(error instanceof Error ? error.message : 'Could not open this rating request.');
      }
    },
    [startCampaign],
  );

  useEffect(() => {
    if (!session || step === 'auth') return;
    void claimAsk(session);
  }, [claimAsk, session, step]);

  const openSaved = useCallback(
    async (target: SubjectSummary) => {
      if (!session) return;
      const card = latestCompleted(target);
      if (!card) {
        await startCampaign(target);
        return;
      }
      const liveId = scorecardIdRef.current;
      if (liveId && pendingAnswers.current.length > 0) {
        await flushAnswers().catch(() => undefined);
      }
      if (subject && liveId && !result && Object.keys(answers).length > 0) {
        patchLocalDraft(subject.id, liveId, answers);
      }
      setBusy(true);
      setLobbyError(null);
      try {
        const detail = await api.getScorecard(session.accessToken, card.id);
        const nextAnswers = answersFromScorecard(detail.answers);
        if (Object.keys(nextAnswers).length === 0) {
          throw new Error('That scorecard has no answers to show.');
        }
        const selected = detail.selectedDimensionIds ?? [];
        setDimensionIds(selected);
        setSubject(target);
        setScorecardId(detail.id);
        setAnswers(nextAnswers);
        const nextResult = buildResult(nextAnswers, selected);
        setResult(nextResult);
        setLastScorecard({ result: nextResult, subjectName: target.displayName, saved: true });
        setViewingSaved(true);
        setShareHint(null);
      setStep('results');
    } catch (error) {
        setLobbyError(error instanceof Error ? error.message : 'Could not open that scorecard.');
      } finally {
        setBusy(false);
      }
    },
    [answers, flushAnswers, patchLocalDraft, result, session, startCampaign, subject],
  );

  const deleteRating = useCallback(
    async (target: SubjectSummary) => {
      if (!session) return;
      const card = latestCompleted(target) ?? latestDraft(target);
      if (!card || (card._count?.feedbackLinks ?? 0) > 0) return;
      setBusy(true);
      setLobbyError(null);
      try {
        await api.deleteScorecard(session.accessToken, card.id);
        pendingAnswers.current = [];
        setSubjects((current) =>
          current.map((row) =>
            row.id === target.id
              ? { ...row, scorecards: row.scorecards.filter((item) => item.id !== card.id) }
              : row,
          ),
        );
        if (scorecardId === card.id) {
          setStep('welcome');
          setIndex(0);
          setAnswers({});
          setResult(null);
          setViewingSaved(false);
          setSubject(null);
          setScorecardId(null);
        }
      } catch (error) {
        setLobbyError(error instanceof Error ? error.message : 'Could not delete that rating.');
      } finally {
        setBusy(false);
      }
    },
    [scorecardId, session],
  );

  const deletePerson = useCallback(
    async (target: SubjectSummary) => {
      if (!session) return;
      setBusy(true);
      setLobbyError(null);
      try {
        await api.deleteSubject(session.accessToken, target.id);
        pendingAnswers.current = [];
        setSubjects((current) => current.filter((row) => row.id !== target.id));
        if (subject?.id === target.id) {
          setStep('welcome');
          setIndex(0);
          setAnswers({});
          setResult(null);
          setViewingSaved(false);
          setSubject(null);
          setScorecardId(null);
        }
      } catch (error) {
        setLobbyError(error instanceof Error ? error.message : 'Could not remove that person.');
      } finally {
        setBusy(false);
      }
    },
    [session, subject?.id],
  );

  const addPerson = useCallback(
    async (input: { displayName: string; industry?: string; gender?: Gender | null }) => {
      if (!session) return null;
      setBusy(true);
      setLobbyError(null);
      try {
        const created = await api.createSubject(session.accessToken, input);
        setSubjects((current) => [created, ...current.filter((row) => row.id !== created.id)]);
        return created;
      } catch (error) {
        setLobbyError(error instanceof Error ? error.message : 'Could not add that person.');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [session],
  );

  const openPerson = useCallback(
    (target: SubjectSummary) => {
      const draft = latestDraft(target);
      const done = latestCompleted(target);
      if (personStatus(target) === 'sent' || (done && (!draft || (draft.answeredCount ?? 0) === 0))) {
        void openSaved(target);
        return;
      }
      void startCampaign(target);
    },
    [openSaved, startCampaign],
  );

  const scorecardReturnIndex = useRef<number | null>(null);

  const openCategory = useCallback(
    (dimensionId: string) => {
      if (subject && personStatus(subject) === 'sent') return;
      const at = activeDimensions.findIndex((dimension) => dimension.id === dimensionId);
      if (at < 0) return;
      const start = dimensionStartIn(activeDimensions, at);
      scorecardReturnIndex.current = start;
      setShareOpen(false);
      setIndex(start);
      setStep('question');
    },
    [activeDimensions, subject],
  );

  const previousQuestion = useCallback(() => {
    if (index <= 0) return;
    setShareHint(null);
    setStep('question');
    setIndex(index - 1);
  }, [index]);

  const leaveQuestion = useCallback(() => {
    if (scorecardReturnIndex.current != null) {
      scorecardReturnIndex.current = null;
      setStep('results');
      return;
    }
    resetFlow('rate');
  }, [resetFlow]);

  const continueFromRecap = useCallback(() => {
    const lastDone = lastCompletedIn(activeDimensions, answers);
    if (recapDimensionIndex < lastDone) {
      setRecapDimensionIndex(recapDimensionIndex + 1);
      return;
    }
    const next = recapDimensionIndex + 1;
    if (next < activeDimensions.length) {
      setIndex(dimensionStartIn(activeDimensions, next));
      setStep('question');
      return;
    }
    void finishQuiz(answers);
  }, [activeDimensions, answers, finishQuiz, recapDimensionIndex]);

  const reviewRecapStage = useCallback(() => {
    setIndex(dimensionStartIn(activeDimensions, recapDimensionIndex));
    setStep('question');
  }, [activeDimensions, recapDimensionIndex]);

  const closeSavedCard = useCallback(() => {
    setResult(null);
    setViewingSaved(false);
    setStep('welcome');
    setTab('home');
    setSubject(null);
    setScorecardId(null);
    setShareHint(null);
    setShareOpen(false);
  }, []);

  const onShare = useCallback(() => {
    setShareHint(null);
    setShareOpen(true);
  }, []);

  const onSendEmail = useCallback(
    async (payload: { to: string; channel: 'self' | 'anonymous' }) => {
      if (!result) return;
      setShareBusy(true);
      setShareHint(null);
      try {
        const token = session?.accessToken;
        if (!token || !scorecardId) {
          throw new Error(`Sign in again to send from ${APP_NAME}.`);
        }
        const sent = await api.shareScorecard(token, scorecardId, {
          to: payload.to,
          channel: payload.channel,
        });
        const sharedId = scorecardId;
        setSubjects((current) =>
          current.map((row) => ({
            ...row,
            scorecards: row.scorecards.map((card) =>
              card.id === sharedId
                ? { ...card, _count: { feedbackLinks: (card._count?.feedbackLinks ?? 0) + 1 } }
                : card,
            ),
          })),
        );
        if (payload.channel === 'anonymous') {
          setShareOpen(false);
          setShareHint(`Sent anonymously to ${payload.to}.`);
          return;
        }
        await Linking.openURL(scorecardMailto(payload.to, sent.subject, sent.body));
        setShareOpen(false);
        setShareHint(`Scorecard ready to send to ${payload.to} from your email.`);
      } catch (error) {
        setShareHint(
          error instanceof Error
            ? error.message
            : payload.channel === 'anonymous'
              ? 'Could not send anonymously. Try your email instead.'
              : 'Could not open your mail app. Check the address and try again.',
        );
      } finally {
        setShareBusy(false);
      }
    },
    [result, scorecardId, session?.accessToken],
  );

  const question = useMemo(
    () => getQuestionFrom(activeDimensions, index),
    [activeDimensions, index],
  );
  const recapDimension = activeDimensions[recapDimensionIndex];
  const recapScore = useMemo(
    () => (recapDimension ? scoreDimension(recapDimension, answers) : null),
    [answers, recapDimension],
  );
  const nextDimension = activeDimensions[recapDimensionIndex + 1] ?? null;
  const completedThrough = lastCompletedIn(activeDimensions, answers);

  const saveProfile = useCallback(
    async (input: InsightInput) => {
      if (!session) return;
      const user = await api.updateProfile(session.accessToken, input);
      const next = { ...session, user: { ...session.user, ...user } };
      setSession(next);
      await saveSession(next);
    },
    [session],
  );

  const saveSubjectProfile = useCallback(
    async (input: InsightInput) => {
      if (!session || !profileSubject) return;
      const updated = await api.updateSubject(session.accessToken, profileSubject.id, input);
      setSubjects((current) => current.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
      setSubject((current) => (current?.id === updated.id ? { ...current, ...updated } : current));
    },
    [profileSubject, session],
  );
  const inQuiz = step === 'intro' || step === 'question' || step === 'recap';
  const viewingResult = step === 'results' && (result ?? lastScorecard?.result) != null;
  const stageCurrent = step === 'recap' ? recapDimensionIndex : (question?.dimensionIndex ?? 0);
  const questTotal = question?.dimension.parameters.length ?? 5;
  const questCurrent = question?.parameterIndex ?? 0;
  const selectedValue = question ? answers[question.parameter.id] : undefined;
  const scorecardResult = result ?? lastScorecard?.result ?? null;
  const scorecardName = subject?.displayName ?? lastScorecard?.subjectName ?? null;
  const userInitial = session
    ? (session.user.displayName?.trim() || session.user.email).charAt(0).toUpperCase()
    : undefined;
  const showHome = step !== 'auth' && tab === 'home' && !inQuiz && !viewingResult;
  const showRateSelect = step !== 'auth' && tab === 'rate' && !inQuiz && !viewingResult;
  const showFeedback = step !== 'auth' && tab === 'feedback' && !inQuiz && !viewingResult;
  const showMe = step !== 'auth' && tab === 'me' && !inQuiz && !viewingResult;
  const showQuiz = inQuiz;
  const showScorecard = viewingResult && !inQuiz;
  const openAccount = () => {
    if (inQuiz || viewingResult) {
      resetFlow('me');
      return;
    }
    setTab('me');
  };
  const unread = inbox.filter((item) => !seenIds.includes(item.id)).length;

  if (!splashDone || !ready || onboarded == null) {
    return <SplashScreen ready={ready && onboarded != null} onFinished={() => setSplashDone(true)} />;
  }

  if (!session && !onboarded) {
    return (
      <WelcomeOnboarding
        onDone={() => {
          void AsyncStorage.setItem(ONBOARD_KEY, '1');
          setOnboarded(true);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.playRoot}>
        <View style={[styles.playSheet, session ? { paddingBottom: navSpace } : null]}>
          {step === 'auth' ? (
            <AuthScreen onAuthenticated={(payload) => void onAuthenticated(payload)} />
          ) : null}

          {showHome && session ? (
            <HomeDashboard
              user={session.user}
              subjects={subjects}
              inbox={inbox}
              seenIds={seenIds}
              onRate={() => setTab('rate')}
              onOpenRated={(target) => {
                void openSaved(target);
              }}
              onAsk={() => setAskOpen(true)}
              onOpenFeedback={() => setTab('feedback')}
              onOpenInboxItem={(id) => {
                markSeen(id);
                setInboxFocus(id);
                setTab('feedback');
              }}
              error={lobbyError}
            />
          ) : null}

          {showRateSelect && session ? (
            <ManagerSelect
              subjects={subjects}
              busy={busy}
              error={lobbyError}
              onAddPerson={async (input) => {
                const created = await addPerson(input);
                if (created) void startCampaign(created);
              }}
              onStart={(target) => {
                openPerson(target);
              }}
              onOpenProfile={setProfileSubject}
            />
          ) : null}

          {showQuiz ? (
            <>
              {step === 'intro' && subject ? (
                <AssessmentIntro
                  subjectName={subject.displayName}
                  subjectMeta={[subject.industry, genderLabel(subject.gender)].filter(Boolean).join(' · ')}
                  initialSelected={dimensionIds}
                  error={lobbyError}
                  onStart={(ids) => {
                    void (async () => {
                      if (!session || !scorecardId) return;
                      setBusy(true);
                      setLobbyError(null);
                      try {
                        await api.setDimensions(session.accessToken, scorecardId, ids);
                        setDimensionIds(ids);
                        setIndex(0);
                        setStep('question');
                      } catch (error) {
                        setLobbyError(error instanceof Error ? error.message : 'Could not save those categories.');
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                  onBack={() => {
                    setStep('welcome');
                    setTab('rate');
                  }}
                />
              ) : null}
              {step === 'question' && question ? (
                <>
                  <GameHud
                    title={question.dimension.title}
                    subjectName={subject?.displayName}
                    current={questCurrent}
                    total={questTotal}
                    stageCurrent={stageCurrent}
                    stageTotal={activeDimensions.length}
                    questionIndex={index}
                    questionTotal={activeCount}
                    onClose={() => setLeaveOpen(true)}
                    onHome={leaveQuestion}
                  />
                  <View style={styles.questionWrap}>
                    <Text style={styles.paramPrompt}>{question.parameter.prompt}</Text>
                    <ScrollView
                      style={styles.optionScroll}
                      contentContainerStyle={styles.optionScrollInner}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      <ScaleOptionList
                        options={question.parameter.options}
                        selected={selectedValue}
                        onSelect={selectValue}
                      />
                    </ScrollView>
                    <Pressable
                      style={styles.autoRow}
                      onPress={() => {
                        const next = !autoAdvance;
                        if (!next && advanceTimer.current) {
                          clearTimeout(advanceTimer.current);
                          advanceTimer.current = null;
                        }
                        setAutoAdvance(next);
                        void AsyncStorage.setItem(AUTO_ADVANCE_KEY, next ? '1' : '0');
                      }}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: autoAdvance }}
                    >
                      <View style={[styles.autoBox, autoAdvance && styles.autoBoxOn]}>
                        {autoAdvance ? <Text style={styles.autoMark}>✓</Text> : null}
                      </View>
                      <View style={styles.autoCopy}>
                        <Text style={styles.autoLabel}>Automatically move to next question</Text>
                        <Text style={styles.autoHint}>
                          {autoAdvance
                            ? 'On · the next question opens after you answer'
                            : 'Off · use Continue after each answer'}
                        </Text>
                      </View>
                    </Pressable>
                    {index > 0 ? (
                      <Pressable onPress={previousQuestion} hitSlop={8} accessibilityRole="button" style={styles.previousHit}>
                        <Text style={styles.previous}>Previous question</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={advanceQuestion}
                      disabled={selectedValue == null}
                      accessibilityRole="button"
                      style={[styles.continue, selectedValue == null && styles.continueOff]}
                    >
                      <Text style={styles.continueLabel}>
                        {index === activeCount - 1 ? 'See the scorecard' : 'Continue'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : null}
              {step === 'recap' && recapScore ? (
                <RecapPanel
                  dimension={recapDimension}
                  worldIndex={recapDimensionIndex}
                  worldTotal={activeDimensions.length}
                  average={recapScore.average}
                  comment={categoryComment(recapScore.average, recapDimension.id, answers)}
                  nextDimension={nextDimension}
                  completedThrough={completedThrough}
                  onContinue={continueFromRecap}
                  onSelectSection={setRecapDimensionIndex}
                  onReview={reviewRecapStage}
                  onSaveLater={() => resetFlow('rate')}
                  userInitial={userInitial}
                  onAvatarPress={openAccount}
                />
              ) : null}
            </>
          ) : null}

          {showFeedback && session ? (
            <FeedbackPanel
              items={inbox}
              requests={requests}
              seenIds={seenIds}
              focusId={inboxFocus}
              onOpen={markSeen}
              onBackToList={() => setInboxFocus(null)}
            />
          ) : null}

          {showMe && session ? (
            <MePanel
              user={session.user}
              onSave={saveProfile}
              onLogout={() => {
                void signOut();
              }}
              onAsk={() => setAskOpen(true)}
            />
          ) : null}

          {showScorecard && scorecardResult ? (
            <ResultsPanel
              result={scorecardResult}
              answers={answers}
              subjectName={scorecardName}
              subjectRole={
                [subject?.roleTitle, subject?.company].filter(Boolean).join(' · ') || subject?.industry
              }
              completedAt={subject ? latestCompleted(subject)?.completedAt : null}
              shareHint={shareHint}
              shareOpen={shareOpen}
              shareBusy={shareBusy}
              userInitial={userInitial}
              onAvatarPress={openAccount}
              onShare={onShare}
              onCloseShare={() => setShareOpen(false)}
              onSendEmail={(payload) => {
                void onSendEmail(payload);
              }}
              onRestart={viewingSaved ? closeSavedCard : () => resetFlow()}
              saved={viewingSaved || (!result && lastScorecard?.saved === true)}
              onRateAgain={
                subject && personStatus(subject) !== 'sent'
                  ? () => {
                      void (async () => {
                        if (!session) return;
                        const finished = subject.scorecards.filter((card) => card.status === 'COMPLETED');
                        try {
                          for (const card of finished) {
                            await api.deleteScorecard(session.accessToken, card.id);
                          }
                        } catch (error) {
                          setLobbyError(error instanceof Error ? error.message : 'Could not delete the previous rating.');
                          return;
                        }
                        if (finished.length > 0) {
                          const ids = new Set(finished.map((card) => card.id));
                          setSubjects((current) =>
                            current.map((row) =>
                              row.id === subject.id
                                ? { ...row, scorecards: row.scorecards.filter((card) => !ids.has(card.id)) }
                                : row,
                            ),
                          );
                        }
                        await startCampaign({
                          ...subject,
                          scorecards: subject.scorecards.filter((card) => card.status !== 'COMPLETED'),
                        });
                      })();
                    }
                  : undefined
              }
              onDelete={
                subject
                  ? () => {
                      void deleteRating(subject);
                    }
                  : undefined
              }
              onOpenCategory={openCategory}
              locked={subject ? personStatus(subject) === 'sent' : false}
            />
          ) : null}
        </View>
        {session ? (
          <View style={styles.navDock}>
            <BottomNav
              active={viewingResult ? 'home' : tab}
              bottomInset={insets.bottom}
              feedbackUnread={unread}
              onChange={(next) => {
                setInboxFocus(null);
                if (inQuiz || viewingResult) {
                  resetFlow(next);
                  return;
                }
                setTab(next);
              }}
            />
          </View>
        ) : null}
        <AccountSheet
          visible={accountOpen}
          user={session?.user ?? null}
          onClose={() => setAccountOpen(false)}
          onLogout={() => {
            void signOut();
          }}
          onSave={saveProfile}
        />
        <AskRatingSheet
          visible={askOpen}
          onClose={() => setAskOpen(false)}
          onSend={async (email) => {
            if (!session) return;
            await api.requestRating(session.accessToken, email);
            const asked: RatingRequestItem = {
              id: `local-${email.trim().toLowerCase()}`,
              recipientEmail: email.trim().toLowerCase(),
              createdAt: new Date().toISOString(),
              status: 'waiting',
              feedbackId: null,
            };
            setRequests((current) => {
              const next = [asked, ...current.filter((row) => row.recipientEmail !== asked.recipientEmail)];
              void AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(next));
              return next;
            });
            try {
              const remote = await api.ratingRequests(session.accessToken);
              setRequests(remote);
              void AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(remote));
            } catch {
              // The send succeeded. Keep the request on this device if the list is not ready yet.
            }
          }}
        />
        <ProfileSheet
          subject={profileSubject}
          sent={profileSubject ? personStatus(profileSubject) === 'sent' : false}
          busy={busy}
          onClose={() => setProfileSubject(null)}
          onSave={saveSubjectProfile}
          onDelete={() => {
            const target = profileSubject;
            setProfileSubject(null);
            if (!target) return;
            void deletePerson(target);
          }}
        />
        <ConfirmSheet
          visible={leaveOpen}
          placement="dialog"
          title="Leave this rating?"
          message="Your answers so far are saved. You can continue from here later."
          cancelLabel="Keep rating"
          actions={[
            {
              label: 'Save and leave',
              primary: true,
              onPress: () => {
                setLeaveOpen(false);
                resetFlow('rate');
              },
            },
          ]}
          onClose={() => setLeaveOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  playRoot: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  navDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  playSheet: {
    flex: 1,
    backgroundColor: theme.colors.bgElevated,
    paddingHorizontal: 20,
    paddingTop: 16,
    minHeight: 0,
  },
  questionWrap: {
    flex: 1,
    minHeight: 0,
    gap: 10,
  },
  optionScroll: {
    flex: 1,
    minHeight: 0,
  },
  optionScrollInner: {
    paddingBottom: 8,
  },
  paramPrompt: {
    ...type.verdict,
    color: theme.colors.ink,
    fontSize: 26,
    lineHeight: 32,
  },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  autoBox: {
    width: 20,
    height: 20,
    marginTop: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  autoBoxOn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  autoMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  autoCopy: {
    flex: 1,
    gap: 2,
  },
  autoLabel: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  autoHint: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  previousHit: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  previous: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  continue: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueOff: {
    backgroundColor: theme.colors.softBlue,
  },
  continueLabel: {
    ...type.sans,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
