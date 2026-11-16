import { useCallback, useState } from 'react';
import { ArrowRightCircle, Info, X } from 'lucide-react';
import { DomainReceipt } from './components/DomainReceipt';
import { QuestionCard } from './components/QuestionCard';
import { StartScreen } from './components/StartScreen';
import { TopStatusBar } from './components/TopStatusBar';
import { QUESTIONS } from './data/questions';
import {
  advanceQuestion,
  confirmWager,
  createRun,
  evaluateAnswer,
  loadProfile,
  recordRunToProfile,
  resetProfile,
  revealNextClue,
  saveProfile,
  setWagerPoints,
} from './engine';
import type { AnswerResult, PlayerProfile, RunMode, RunState } from './types/quiz';

interface FeedbackState {
  result: AnswerResult;
  coreLink: string;
  trapNote: string;
}

export function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [run, setRun] = useState<RunState | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showStatsSummary, setShowStatsSummary] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const finalizeCompletedRun = useCallback(
    (completedRun: RunState) => {
      const prevBest = profile.bestScore;
      const beatBest = completedRun.score > prevBest && completedRun.score > 0;
      const updatedProfile = recordRunToProfile(profile, completedRun);
      saveProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsNewBest(beatBest);
    },
    [profile],
  );

  const handleStartRun = useCallback(
    (mode: RunMode) => {
      const freshRun = createRun(QUESTIONS, mode, profile);
      setRun(freshRun);
      setFeedback(null);
      setShowInfoModal(false);
      setShowStatsSummary(false);
      setIsNewBest(false);
    },
    [profile],
  );

  const handleResetProfile = useCallback(() => {
    const fresh = resetProfile();
    setProfile(fresh);
    setShowStatsSummary(false);
  }, []);

  const handleSelectAnswer = useCallback(
    (selected: string | string[]) => {
      if (!run || feedback) return;
      const evaluated = evaluateAnswer(run, selected);
      setRun(evaluated.nextState);
      setFeedback({
        result: evaluated.result,
        coreLink: evaluated.coreLink,
        trapNote: evaluated.trapNote,
      });
    },
    [run, feedback],
  );

  const handleRevealClue = useCallback(() => {
    setRun((prev) => (prev ? revealNextClue(prev) : prev));
  }, []);

  const handleSetWagerPoints = useCallback((points: number) => {
    setRun((prev) => (prev ? setWagerPoints(prev, points) : prev));
  }, []);

  const handleConfirmWager = useCallback(() => {
    setRun((prev) => (prev ? confirmWager(prev) : prev));
  }, []);

  const handleNextAfterFeedback = useCallback(() => {
    if (!run) return;
    setFeedback(null);
    setShowInfoModal(false);

    const nextRun = advanceQuestion(run);
    setRun(nextRun);
    if (nextRun.status === 'completed') {
      finalizeCompletedRun(nextRun);
    }
  }, [run, finalizeCompletedRun]);

  const handleExitToHome = useCallback(() => {
    setRun(null);
    setFeedback(null);
    setShowInfoModal(false);
    setShowStatsSummary(false);
    setIsNewBest(false);
  }, []);

  const currentQuestion =
    run && run.status === 'in_progress' ? run.questions[run.currentIndex] : undefined;
  const isFinalQuestion = Boolean(run && run.currentIndex === run.questions.length - 1);

  return (
    <main className="atlas-shell">
      {!run && !showStatsSummary && (
        <StartScreen
          profile={profile}
          onStartRun={handleStartRun}
          onViewSummary={() => setShowStatsSummary(true)}
          onResetProfile={handleResetProfile}
        />
      )}

      {!run && showStatsSummary && (
        <DomainReceipt
          run={null}
          profile={profile}
          isNewBest={false}
          onNewAdaptiveSprint={() => handleStartRun('adaptive')}
          onGoHome={handleExitToHome}
        />
      )}

      {run && run.status === 'in_progress' && currentQuestion && (
        <>
          <TopStatusBar
            totalQuestions={run.questions.length}
            currentIndex={run.currentIndex}
            results={run.results}
            onExit={handleExitToHome}
          />

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              margin: 0,
              width: '100%',
            }}
          />

          <div style={{ paddingBottom: '8px' }}>
            <QuestionCard
              question={currentQuestion}
              isFinalQuestion={isFinalQuestion}
              rightAnswersSoFar={run.rightAnswersSoFar}
              cluesRevealed={run.cluesRevealed}
              activeWager={run.activeWager}
              wagerConfirmed={run.wagerConfirmed}
              submittedResult={feedback?.result ?? null}
              onSelectAnswer={handleSelectAnswer}
              onRevealClue={handleRevealClue}
              onSetWagerPoints={handleSetWagerPoints}
              onConfirmWager={handleConfirmWager}
            />
          </div>

          {feedback && (() => {
            const res = feedback.result;
            const isCorrect = res.isCorrect;
            const statusColor = isCorrect
              ? 'var(--accent-emerald)'
              : 'var(--accent-crimson)';
            const isLastQuestion = run.currentIndex + 1 >= run.questions.length;

            const explanationText = isCorrect
              ? feedback.coreLink
              : feedback.trapNote || feedback.coreLink;

            return (
              <>
                <div
                  className="post-answer-bar fade-in"
                  role="region"
                  aria-label="Post-answer actions"
                >
                  <button
                    type="button"
                    className="post-answer-half"
                    onClick={() => setShowInfoModal(true)}
                    aria-label="Explanation"
                    title="Explanation"
                  >
                    <Info size={22} color="#FFFFFF" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="post-answer-half"
                    onClick={handleNextAfterFeedback}
                    aria-label={isLastQuestion ? 'View summary' : 'Next question'}
                    title={isLastQuestion ? 'View summary' : 'Next question'}
                  >
                    <ArrowRightCircle size={22} color="#FFFFFF" aria-hidden="true" />
                  </button>
                </div>

                {showInfoModal && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Answer explanation"
                    onClick={() => setShowInfoModal(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 35,
                      background: 'rgba(0, 0, 0, 0.85)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                    }}
                  >
                    <div
                      className="fade-in"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        maxWidth: '390px',
                        padding: '18px',
                        borderRadius: '6px',
                        background: '#000000',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: statusColor,
                          }}
                        >
                          Explanation
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowInfoModal(false)}
                          aria-label="Close explanation"
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: 'transparent',
                            color: '#FFFFFF',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={17} aria-hidden="true" />
                        </button>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.96rem',
                          lineHeight: 1.55,
                          color: '#FFFFFF',
                        }}
                      >
                        {explanationText}
                      </p>

                      <button
                        type="button"
                        className="tactile-btn btn-tonal"
                        style={{ width: '100%', minHeight: '44px' }}
                        onClick={() => setShowInfoModal(false)}
                      >
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}

      {run && run.status === 'completed' && (
        <DomainReceipt
          run={run}
          profile={profile}
          isNewBest={isNewBest}
          onNewAdaptiveSprint={() => handleStartRun('adaptive')}
          onGoHome={handleExitToHome}
        />
      )}
    </main>
  );
}

export default App;
