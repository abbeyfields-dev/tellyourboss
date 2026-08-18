import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHud } from '../components/GameHud';
import { RecapPanel } from '../components/RecapPanel';
import { ResultsPanel } from '../components/ResultsPanel';
import { ScaleOptionList } from '../components/ScaleOptionList';
import { SplashScreen } from '../components/SplashScreen';
import { VibeTicker } from '../components/VibeTicker';
import { WelcomePanel } from '../components/WelcomePanel';
import { WorldIcon } from '../components/WorldIcon';
import {
  DIMENSIONS,
  QUESTION_COUNT,
  getQuestion,
  isLastInDimension,
  type ScaleValue,
} from '../data/dimensions';
import {
  buildResult,
  formatScore,
  resultShareText,
  scoreDimension,
  type Answers,
  type QuizResult,
} from '../data/score';
import {
  loadRatingState,
  recordCompletedRating,
  saveRatingState,
  type RatingState,
} from '../state/ratingStore';
import { theme } from '../theme';

type Step = 'welcome' | 'question' | 'recap' | 'results';

export function TellYourBossScreen(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [stats, setStats] = useState<RatingState | null>(null);
  const [step, setStep] = useState<Step>('welcome');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [recapDimensionIndex, setRecapDimensionIndex] = useState(0);
  const [shareHint, setShareHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const state = await loadRatingState();
      if (!cancelled) {
        setStats(state);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistStats = useCallback(async (next: RatingState) => {
    setStats(next);
    await saveRatingState(next);
  }, []);

  const resetFlow = useCallback(() => {
    setStep('welcome');
    setIndex(0);
    setAnswers({});
    setResult(null);
    setRecapDimensionIndex(0);
    setShareHint(null);
  }, []);

  const finishQuiz = useCallback(
    async (nextAnswers: Answers) => {
      if (!stats) return;
      const nextResult = buildResult(nextAnswers);
      setResult(nextResult);
      setStep('results');
      await persistStats(recordCompletedRating(stats, nextResult.overall, nextResult.archetype));
    },
    [persistStats, stats],
  );

  const onPick = useCallback(
    (value: ScaleValue) => {
      const current = getQuestion(index);
      if (!current) return;
      const nextAnswers = { ...answers, [current.parameter.id]: value };
      setAnswers(nextAnswers);

      if (index === QUESTION_COUNT - 1) {
        void finishQuiz(nextAnswers);
        return;
      }

      if (isLastInDimension(current)) {
        setRecapDimensionIndex(current.dimensionIndex);
        setStep('recap');
        return;
      }

      setIndex(index + 1);
    },
    [answers, finishQuiz, index],
  );

  const goBack = useCallback(() => {
    setShareHint(null);
    if (step === 'results') {
      setResult(null);
      setStep('question');
      setIndex(QUESTION_COUNT - 1);
      return;
    }
    if (step === 'recap') {
      setStep('question');
      return;
    }
    if (index === 0) {
      resetFlow();
      return;
    }
    setIndex(index - 1);
  }, [index, resetFlow, step]);

  const continueFromRecap = useCallback(() => {
    setIndex(index + 1);
    setStep('question');
  }, [index]);

  const onShare = useCallback(async () => {
    if (!result) return;
    try {
      const shareResult = await Share.share({
        message: resultShareText(result),
        title: `Boss-Rater · ${result.archetype}`,
      });
      if (shareResult.action === Share.sharedAction) {
        setShareHint('Scorecard sent. Good luck out there.');
      }
    } catch {
      setShareHint('Sharing was cancelled. The scorecard is still here.');
    }
  }, [result]);

  const question = useMemo(() => getQuestion(index), [index]);
  const recapDimension = DIMENSIONS[recapDimensionIndex];
  const recapScore = useMemo(
    () => (recapDimension ? scoreDimension(recapDimension, answers) : null),
    [answers, recapDimension],
  );
  const nextDimension = DIMENSIONS[recapDimensionIndex + 1] ?? null;

  if (!splashDone || !ready || !stats) {
    return <SplashScreen ready={ready} onFinished={() => setSplashDone(true)} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        {step === 'welcome' ? (
          <View style={styles.welcomeHeader}>
            <Text style={styles.kicker}>Boss-Rater</Text>
            <Text style={styles.tagline}>A campaign scorecard for the person who runs your 1:1s.</Text>
          </View>
        ) : (
          <View style={styles.playHeader}>
            <Text style={styles.kicker}>Boss-Rater</Text>
            {step === 'results' && result ? (
              <Text style={styles.playMeta}>
                Rank unlocked · {formatScore(result.overall)} / 5
              </Text>
            ) : (
              <Text style={styles.playMeta}>
                {step === 'recap'
                  ? `World ${recapDimensionIndex + 1} of ${DIMENSIONS.length}`
                  : question
                    ? `World ${question.dimensionIndex + 1} of ${DIMENSIONS.length}`
                    : ''}
              </Text>
            )}
          </View>
        )}

        <View style={styles.panel}>
          {step !== 'welcome' && step !== 'results' ? (
            <GameHud
              badge={
                step === 'recap'
                  ? `WORLD ${recapDimensionIndex + 1} / ${DIMENSIONS.length}`
                  : question
                    ? `QUEST ${question.parameterIndex + 1} / ${question.dimension.parameters.length}`
                    : ''
              }
              title={
                step === 'recap'
                  ? recapDimension.title
                  : (question?.dimension.title ?? '')
              }
              worldId={step === 'recap' ? recapDimension.id : question?.dimension.id}
              accent={
                step === 'recap'
                  ? recapDimension.accent
                  : (question?.dimension.accent ?? theme.colors.royal)
              }
              total={QUESTION_COUNT}
              current={index}
              backLabel={index === 0 && step === 'question' ? 'Home' : 'Back'}
              onBack={goBack}
            />
          ) : null}

          {step === 'welcome' ? (
            <WelcomePanel
              completed={stats.completed}
              lastOverall={stats.lastOverall}
              lastArchetype={stats.lastArchetype}
              onStart={() => {
                setStep('question');
                setIndex(0);
                setAnswers({});
                setResult(null);
              }}
            />
          ) : null}

          {step === 'question' && question ? (
            <View style={styles.questionWrap}>
              <View style={styles.dimensionRow}>
                <WorldIcon id={question.dimension.id} color={question.dimension.accent} size={18} />
                <Text style={[styles.dimensionTitle, { color: question.dimension.accent }]}>
                  {question.dimension.title}
                </Text>
              </View>
              <Text style={styles.paramTitle}>{question.parameter.title}</Text>
              <Text style={styles.paramPrompt}>{question.parameter.prompt}</Text>
              <ScaleOptionList
                options={question.parameter.options}
                selected={answers[question.parameter.id]}
                onSelect={onPick}
              />
            </View>
          ) : null}

          {step === 'recap' && recapScore ? (
            <RecapPanel
              dimension={recapDimension}
              worldIndex={recapDimensionIndex}
              worldTotal={DIMENSIONS.length}
              average={recapScore.average}
              nextDimension={nextDimension}
              onContinue={continueFromRecap}
            />
          ) : null}

          {step === 'results' && result ? (
            <ResultsPanel
              result={result}
              shareHint={shareHint}
              onShare={() => {
                void onShare();
              }}
              onRestart={resetFlow}
            />
          ) : null}
        </View>
      </View>
      <VibeTicker />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  screen: {
    flex: 1,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.sm,
  },
  welcomeHeader: {
    gap: 6,
    marginBottom: theme.space.md,
  },
  playHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.space.md,
    gap: 12,
  },
  kicker: {
    color: theme.colors.onNavy,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  tagline: {
    color: theme.colors.onNavyMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  playMeta: {
    color: theme.colors.onNavyMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  panel: {
    flex: 1,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.xl,
    padding: theme.space.md,
    minHeight: 0,
    ...theme.shadow.card,
  },
  questionWrap: {
    flex: 1,
    minHeight: 0,
    gap: 6,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dimensionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  paramTitle: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  paramPrompt: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
});
