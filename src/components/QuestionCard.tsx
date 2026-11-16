import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Eye, GripVertical, Minus, Plus } from 'lucide-react';
import type { AnswerResult, Question, QuestionOption } from '../types/quiz';
import { DOMAIN_LABELS } from './domainMeta';
import { PhysicalMap } from './PhysicalMap';

interface QuestionCardProps {
  question: Question;
  isFinalQuestion: boolean;
  rightAnswersSoFar: number;
  cluesRevealed: number;
  activeWager: number;
  wagerConfirmed: boolean;
  submittedResult: AnswerResult | null;
  onSelectAnswer: (selected: string | string[]) => void;
  onRevealClue: () => void;
  onSetWagerPoints: (points: number) => void;
  onConfirmWager: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const DRAG_THRESHOLD_PX = 6;
const FLIP_TRANSITION = 'transform 280ms cubic-bezier(0.2, 0, 0, 1)';

function shuffleArray<T>(source: readonly T[]): T[] {
  const items = [...source];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}

function getRandomShuffledOptions(question: Question): QuestionOption[] {
  const items = shuffleArray(question.options);

  // Ensure initial ordering is never pre-solved
  if (Array.isArray(question.answer)) {
    const isAlreadySolved = items.every((opt, idx) => opt.id === question.answer[idx]);
    if (isAlreadySolved && items.length >= 2) {
      const first = items[0];
      items[0] = items[1];
      items[1] = first;
    }
  }
  return items;
}

function getInstructionText(type: Question['type']): string {
  switch (type) {
    case 'ordering':
    case 'causal':
      return 'Rearrange these boxes in the right order';
    case 'map':
      return 'Tap the right location on the map';
    case 'compare':
      return 'Sort each item into the right group';
    default:
      return 'Select the right answer';
  }
}

export function QuestionCard({
  question,
  isFinalQuestion,
  rightAnswersSoFar,
  cluesRevealed,
  activeWager,
  wagerConfirmed,
  submittedResult,
  onSelectAnswer,
  onRevealClue,
  onSetWagerPoints,
  onConfirmWager,
}: QuestionCardProps) {
  const isLocked = submittedResult !== null;
  const isSequenceType = question.type === 'ordering' || question.type === 'causal';

  // Ordering / Causal state
  const initialOrdered = useMemo(() => getRandomShuffledOptions(question), [question]);
  const shuffledMcOptions = useMemo(() => shuffleArray(question.options), [question]);
  const shuffledCompareItems = useMemo(
    () => shuffleArray(question.compareSpec?.items ?? []),
    [question],
  );
  const [orderedItems, setOrderedItems] = useState<QuestionOption[]>(initialOrdered);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showingCorrectOrder, setShowingCorrectOrder] = useState(false);

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevTopsRef = useRef<Map<string, number>>(new Map());
  const prevDraggedOffsetTopRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef(false);
  const dragSessionRef = useRef<{
    itemId: string;
    pointerId: number;
    startY: number;
    currentY: number;
    isHandle: boolean;
    isDragging: boolean;
  } | null>(null);

  // Compare state
  const [compareAssignments, setCompareAssignments] = useState<Record<string, 'left' | 'right'>>({});

  const snapshotPositions = useCallback((excludeId?: string | null) => {
    const tops = new Map<string, number>();
    for (const [id, el] of itemRefs.current.entries()) {
      if (excludeId && id === excludeId) continue;
      tops.set(id, el.getBoundingClientRect().top);
    }
    prevTopsRef.current = tops;
  }, []);

  useEffect(() => {
    setOrderedItems(initialOrdered);
    setPickedIndex(null);
    setDraggingId(null);
    setShowingCorrectOrder(false);
    prevTopsRef.current.clear();
    prevDraggedOffsetTopRef.current = null;
    suppressNextClickRef.current = false;
    dragSessionRef.current = null;
    setCompareAssignments({});
  }, [question, initialOrdered]);

  // MD3 Expressive Motion FLIP transition for sibling boxes, tap-to-swap, and auto-reorder
  useLayoutEffect(() => {
    if (!isSequenceType) return;

    const session = dragSessionRef.current;
    const activeDragId = session?.isDragging ? session.itemId : null;

    if (activeDragId && prevDraggedOffsetTopRef.current !== null && session) {
      const draggedEl = itemRefs.current.get(activeDragId);
      if (draggedEl) {
        const layoutShift = draggedEl.offsetTop - prevDraggedOffsetTopRef.current;
        session.startY += layoutShift;
        const deltaY = session.currentY - session.startY;
        draggedEl.style.transition = 'none';
        draggedEl.style.transform = `translate3d(0, ${deltaY}px, 0) scale(1.02)`;
      }
      prevDraggedOffsetTopRef.current = null;
    }

    if (prevTopsRef.current.size === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    for (const item of orderedItems) {
      if (item.id === activeDragId) continue;
      const el = itemRefs.current.get(item.id);
      const prevTop = prevTopsRef.current.get(item.id);
      if (!el || prevTop === undefined) continue;

      el.style.transition = 'none';
      el.style.transform = '';
      const newTop = el.getBoundingClientRect().top;
      const deltaY = prevTop - newTop;

      if (!reducedMotion && Math.abs(deltaY) > 0.5) {
        el.style.transform = `translate3d(0, ${deltaY}px, 0)`;
        void el.offsetHeight;
        el.style.transition = FLIP_TRANSITION;
        el.style.transform = 'translate3d(0, 0, 0)';
      } else {
        el.style.transition = '';
      }
    }

    prevTopsRef.current.clear();
  }, [orderedItems, isSequenceType]);

  // Auto-animate ordering/causal spine into correct sequence on wrong answer
  useEffect(() => {
    if (
      !isSequenceType ||
      !submittedResult ||
      submittedResult.isCorrect ||
      !Array.isArray(question.answer)
    ) {
      return;
    }

    const answerOrder = question.answer;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delayMs = reducedMotion ? 0 : 350;

    const timer = window.setTimeout(() => {
      snapshotPositions();
      setOrderedItems((prev) => {
        const byId = new Map(prev.map((item) => [item.id, item]));
        const sorted = answerOrder
          .map((id) => byId.get(id))
          .filter((item): item is QuestionOption => Boolean(item));
        return sorted.length === prev.length ? sorted : prev;
      });
      setShowingCorrectOrder(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [question, isSequenceType, submittedResult, snapshotPositions]);

  const handleOrderingChipTap = (index: number) => {
    if (isLocked || draggingId !== null) return;
    if (pickedIndex === null) {
      setPickedIndex(index);
      return;
    }
    if (pickedIndex === index) {
      setPickedIndex(null);
      return;
    }
    snapshotPositions();
    setOrderedItems((prev) => {
      const next = [...prev];
      const temp = next[pickedIndex];
      next[pickedIndex] = next[index];
      next[index] = temp;
      return next;
    });
    setPickedIndex(null);
  };

  const handleOrderPointerDown = (e: React.PointerEvent<HTMLDivElement>, itemId: string) => {
    if (isLocked) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const target = e.target as HTMLElement;
    const isHandle = Boolean(target.closest('[data-drag-handle="true"]'));

    suppressNextClickRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);

    dragSessionRef.current = {
      itemId,
      pointerId: e.pointerId,
      startY: e.clientY,
      currentY: e.clientY,
      isHandle,
      isDragging: isHandle,
    };

    if (isHandle) {
      suppressNextClickRef.current = true;
      setPickedIndex(null);
      setDraggingId(itemId);
      const el = e.currentTarget;
      el.style.transition = 'none';
      el.style.transform = 'translate3d(0, 0, 0) scale(1.02)';
      el.style.zIndex = '20';
      el.style.borderColor = '#FFFFFF';
      el.style.userSelect = 'none';
    }
  };

  const handleOrderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || e.pointerId !== session.pointerId || isLocked) return;

    session.currentY = e.clientY;
    const rawDeltaY = e.clientY - session.startY;

    if (!session.isDragging) {
      if (Math.abs(rawDeltaY) < DRAG_THRESHOLD_PX) return;
      session.isDragging = true;
      suppressNextClickRef.current = true;
      setPickedIndex(null);
      setDraggingId(session.itemId);
    }

    const draggedEl = itemRefs.current.get(session.itemId);
    if (!draggedEl) return;

    const deltaY = session.currentY - session.startY;
    draggedEl.style.transition = 'none';
    draggedEl.style.transform = `translate3d(0, ${deltaY}px, 0) scale(1.02)`;
    draggedEl.style.zIndex = '20';
    draggedEl.style.borderColor = '#FFFFFF';
    draggedEl.style.userSelect = 'none';

    const containerEl = listContainerRef.current;
    if (!containerEl) return;
    const containerTop = containerEl.getBoundingClientRect().top;
    const draggedRect = draggedEl.getBoundingClientRect();
    const draggedCenterY = draggedRect.top + draggedRect.height / 2;

    const currentIdx = orderedItems.findIndex((item) => item.id === session.itemId);
    if (currentIdx === -1) return;

    for (let i = 0; i < orderedItems.length; i++) {
      if (i === currentIdx) continue;
      const siblingEl = itemRefs.current.get(orderedItems[i].id);
      if (!siblingEl) continue;

      const slotMidY = containerTop + siblingEl.offsetTop + siblingEl.offsetHeight / 2;

      if ((i < currentIdx && draggedCenterY < slotMidY) || (i > currentIdx && draggedCenterY > slotMidY)) {
        snapshotPositions(session.itemId);
        prevDraggedOffsetTopRef.current = draggedEl.offsetTop;
        setOrderedItems((prev) => {
          const fromIdx = prev.findIndex((item) => item.id === session.itemId);
          if (fromIdx === -1 || fromIdx === i) return prev;
          const next = [...prev];
          const [moved] = next.splice(fromIdx, 1);
          next.splice(i, 0, moved);
          return next;
        });
        break;
      }
    }
  };

  const handleOrderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || e.pointerId !== session.pointerId) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const wasDragging = session.isDragging;
    const draggedEl = itemRefs.current.get(session.itemId);
    dragSessionRef.current = null;
    prevDraggedOffsetTopRef.current = null;

    if (wasDragging) {
      setDraggingId(null);
      if (draggedEl) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        draggedEl.style.zIndex = '';
        draggedEl.style.borderColor = '';
        draggedEl.style.userSelect = '';
        if (reducedMotion) {
          draggedEl.style.transition = 'none';
          draggedEl.style.transform = '';
        } else {
          draggedEl.style.transition = FLIP_TRANSITION;
          draggedEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
        }
      }
    }
  };

  // Final Question Warning & Wager Gate
  if (isFinalQuestion && !wagerConfirmed && !isLocked) {
    const domainLabel = DOMAIN_LABELS[question.domain].full;
    const halfWager = Math.floor(rightAnswersSoFar / 2);

    return (
      <article className="md3-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '14px',
            borderRadius: '4px',
            background: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Final Question
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
            Topic: {domainLabel}
          </div>
          <div className="tabular-nums" style={{ fontSize: '0.92rem', color: '#FFFFFF' }}>
            Available to bet: <strong>{rightAnswersSoFar} pts</strong>
          </div>
        </div>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            margin: 0,
            width: '100%',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>
            Choose how many points to wager (0–{rightAnswersSoFar})
          </div>

          {/* Stepper: -  [activeWager pts]  + */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <button
              type="button"
              className="tactile-btn btn-tonal"
              disabled={activeWager <= 0}
              onClick={() => onSetWagerPoints(activeWager - 1)}
              aria-label="Decrease wager by 1 point"
              style={{ width: '56px', minHeight: '48px', padding: 0 }}
            >
              <Minus size={18} aria-hidden="true" />
            </button>

            <div
              className="tabular-nums"
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#FFFFFF',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: '#000000',
              }}
            >
              {activeWager} pts
            </div>

            <button
              type="button"
              className="tactile-btn btn-tonal"
              disabled={activeWager >= rightAnswersSoFar}
              onClick={() => onSetWagerPoints(activeWager + 1)}
              aria-label="Increase wager by 1 point"
              style={{ width: '56px', minHeight: '48px', padding: 0 }}
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Quick presets when rightAnswersSoFar > 0 */}
          {rightAnswersSoFar > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '8px',
              }}
            >
              {[
                { label: '0', value: 0 },
                { label: `Half (${halfWager})`, value: halfWager },
                { label: `All (${rightAnswersSoFar})`, value: rightAnswersSoFar },
              ].map((preset) => {
                const isSelected = activeWager === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className="tactile-btn"
                    onClick={() => onSetWagerPoints(preset.value)}
                    style={{
                      minHeight: '42px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      background: isSelected ? '#FFFFFF' : '#000000',
                      color: isSelected ? '#000000' : '#FFFFFF',
                      border: isSelected
                        ? '1px solid #FFFFFF'
                        : '1px solid rgba(255, 255, 255, 0.3)',
                      fontSize: '0.84rem',
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          className="tactile-btn btn-primary"
          style={{ width: '100%' }}
          onClick={onConfirmWager}
        >
          <span>Reveal Final Question</span>
        </button>
      </article>
    );
  }

  const renderStimulus = () => {
    if (!question.stimulus) return null;
    const { stimulus } = question;

    if (stimulus.kind === 'excerpt') {
      return (
        <blockquote
          style={{
            margin: 0,
            padding: '2px 0 2px 12px',
            borderLeft: '2px solid rgba(255, 255, 255, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {stimulus.title && (
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
              {stimulus.title}
            </div>
          )}
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-serif)',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              color: '#FFFFFF',
            }}
          >
            “{stimulus.text}”
          </p>
          {stimulus.attribution && (
            <footer style={{ fontSize: '0.76rem', color: '#FFFFFF', fontWeight: 500 }}>
              — {stimulus.attribution}
            </footer>
          )}
        </blockquote>
      );
    }

    if (stimulus.kind === 'table' && stimulus.headers && stimulus.rows) {
      return (
        <div
          style={{
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            background: '#000000',
            overflowX: 'auto',
            padding: '8px 10px',
          }}
        >
          {stimulus.title && (
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '6px',
              }}
            >
              {stimulus.title}
            </div>
          )}
          <table
            className="tabular-nums"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.82rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr>
                {stimulus.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stimulus.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '6px 8px',
                        borderBottom:
                          rIdx < stimulus.rows!.length - 1
                            ? '1px solid rgba(255, 255, 255, 0.22)'
                            : 'none',
                        color: '#FFFFFF',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const renderMcOptions = () => {
    const selectedId = typeof submittedResult?.selected === 'string' ? submittedResult.selected : null;
    const correctId = typeof question.answer === 'string' ? question.answer : null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {shuffledMcOptions.map((opt, idx) => {
          let stateClass = '';
          if (isLocked) {
            if (opt.id === correctId) {
              stateClass = 'is-correct';
            } else if (opt.id === selectedId) {
              stateClass = 'is-wrong';
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isLocked}
              onClick={() => onSelectAnswer(opt.id)}
              className={`option-pill ${stateClass}`}
            >
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  color: '#FFFFFF',
                }}
              >
                {OPTION_LETTERS[idx] ?? opt.id.toUpperCase()}.
              </span>
              <span style={{ flex: 1 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderCompare = () => {
    const spec = question.compareSpec;
    if (!spec) return null;

    const allAssigned = spec.items.every((item) => compareAssignments[item.id] !== undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shuffledCompareItems.map((item) => {
          const assigned = compareAssignments[item.id];
          const isRowCorrect = isLocked && assigned === item.bucket;

          return (
            <div
              key={item.id}
              style={{
                padding: '10px 12px',
                borderRadius: '4px',
                border: isLocked
                  ? isRowCorrect
                    ? '1px solid var(--accent-emerald)'
                    : '1px solid var(--accent-crimson)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                background: isLocked
                  ? isRowCorrect
                    ? 'var(--accent-emerald-soft)'
                    : 'var(--accent-crimson-soft)'
                  : '#000000',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#FFFFFF' }}>
                {item.text}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '8px',
                }}
              >
                {(['left', 'right'] as const).map((bucket) => {
                  const label = bucket === 'left' ? spec.leftLabel : spec.rightLabel;
                  const isPicked = assigned === bucket;
                  const isCorrectBucket = isLocked && item.bucket === bucket;

                  let bg = isPicked ? '#FFFFFF' : '#000000';
                  let color = isPicked ? '#000000' : '#FFFFFF';
                  let border = isPicked
                    ? '1px solid #FFFFFF'
                    : '1px solid rgba(255, 255, 255, 0.3)';

                  if (isLocked) {
                    if (isCorrectBucket) {
                      bg = 'var(--accent-emerald)';
                      color = '#000000';
                      border = '1px solid var(--accent-emerald)';
                    } else if (isPicked) {
                      bg = 'var(--accent-crimson)';
                      color = '#000000';
                      border = '1px solid var(--accent-crimson)';
                    } else {
                      bg = '#000000';
                      color = '#FFFFFF';
                      border = '1px solid rgba(255, 255, 255, 0.22)';
                    }
                  }

                  return (
                    <button
                      key={bucket}
                      type="button"
                      disabled={isLocked}
                      onClick={() =>
                        setCompareAssignments((prev) => ({
                          ...prev,
                          [item.id]: bucket,
                        }))
                      }
                      aria-pressed={isPicked}
                      style={{
                        minHeight: '38px',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: bg,
                        color,
                        border,
                        fontFamily: 'inherit',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: isLocked ? 'default' : 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!isLocked && (
          <button
            type="button"
            className="tactile-btn btn-primary"
            disabled={!allAssigned}
            style={{ width: '100%', marginTop: '4px' }}
            onClick={() =>
              onSelectAnswer(spec.items.map((item) => `${item.id}:${compareAssignments[item.id]}`))
            }
          >
            <span>OK</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <article
      className="md3-card fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '4px 0',
      }}
    >
      {renderStimulus()}

      {/* Prompt */}
      <h2
        style={{
          margin: 0,
          fontSize: '1.04rem',
          fontWeight: 700,
          lineHeight: 1.45,
          color: '#FFFFFF',
        }}
      >
        {question.prompt}
      </h2>

      {/* Unlocked clues & + Clue button (no point penalty text) */}
      {question.type === 'deduction' && question.clues && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cluesRevealed > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {question.clues.slice(0, cluesRevealed).map((clueText, idx) => {
                const clueNum = idx + 1;
                return (
                  <div
                    key={clueNum}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      background: '#000000',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      lineHeight: 1.42,
                    }}
                  >
                    <strong style={{ color: '#FFFFFF', marginRight: '6px' }}>
                      Clue {clueNum}:
                    </strong>
                    {clueText}
                  </div>
                );
              })}
            </div>
          )}

          {!isLocked && cluesRevealed < 3 && (
            <button
              type="button"
              className="tactile-btn btn-tonal"
              style={{
                alignSelf: 'flex-start',
                minHeight: '40px',
                padding: '8px 12px',
                fontSize: '0.82rem',
              }}
              onClick={onRevealClue}
            >
              <Eye size={15} aria-hidden="true" />
              <span>+ Clue</span>
            </button>
          )}
        </div>
      )}

      {/* Horizontal Divider */}
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          margin: '2px 0',
          width: '100%',
        }}
      />

      {/* Brief 1-line Instruction */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: 600 }}>
          {getInstructionText(question.type)}
        </span>
        {isSequenceType && showingCorrectOrder && (
          <span
            className="fade-in"
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--accent-emerald)',
            }}
          >
            Correct Order Shown
          </span>
        )}
      </div>

      {/* MC, Data, Deduction, Synthesis */}
      {(question.type === 'mc' ||
        question.type === 'data' ||
        question.type === 'deduction' ||
        question.type === 'synthesis') &&
        renderMcOptions()}

      {/* Ordering & Causal */}
      {isSequenceType && (
        <div
          ref={listContainerRef}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            userSelect: draggingId ? 'none' : undefined,
          }}
        >
          {orderedItems.map((item, idx) => {
            const isPicked = pickedIndex === idx;
            const isDragging = draggingId === item.id;
            const correctIdAtPos = Array.isArray(question.answer) ? question.answer[idx] : null;
            const isSlotCorrect = isLocked && item.id === correctIdAtPos;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(item.id, el);
                  } else {
                    itemRefs.current.delete(item.id);
                  }
                }}
                onPointerDown={(e) => handleOrderPointerDown(e, item.id)}
                onPointerMove={handleOrderPointerMove}
                onPointerUp={handleOrderPointerUp}
                onPointerCancel={handleOrderPointerUp}
                onTransitionEnd={(e) => {
                  if (e.target === e.currentTarget && e.propertyName === 'transform') {
                    if (dragSessionRef.current?.isDragging && dragSessionRef.current.itemId === item.id) {
                      return;
                    }
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.transition = '';
                  }
                }}
                onClick={() => {
                  if (suppressNextClickRef.current) {
                    suppressNextClickRef.current = false;
                    return;
                  }
                  handleOrderingChipTap(idx);
                }}
                role="button"
                tabIndex={isLocked ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOrderingChipTap(idx);
                  }
                }}
                aria-label={`Position ${idx + 1}: ${item.text}`}
                className={`order-chip ${isLocked ? 'is-locked' : ''} ${isPicked ? 'is-picked' : ''} ${isDragging ? 'is-dragging' : ''}`}
                style={{
                  borderRadius: '4px',
                  borderColor: isLocked
                    ? isSlotCorrect
                      ? 'var(--accent-emerald)'
                      : 'var(--accent-crimson)'
                    : undefined,
                  background: isLocked
                    ? isSlotCorrect
                      ? 'var(--accent-emerald-soft)'
                      : 'var(--accent-crimson-soft)'
                    : undefined,
                }}
              >
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}.
                </span>

                <span style={{ flex: 1 }}>{item.text}</span>

                {!isLocked && (
                  <button
                    type="button"
                    data-drag-handle="true"
                    aria-label={`Drag to reorder ${item.text}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      touchAction: 'none',
                      width: '36px',
                      height: '40px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'transparent',
                      color: '#FFFFFF',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: isDragging ? 'grabbing' : 'grab',
                      flexShrink: 0,
                    }}
                  >
                    <GripVertical size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}

          {!isLocked && (
            <button
              type="button"
              className="tactile-btn btn-primary"
              style={{ width: '100%', marginTop: '6px' }}
              onClick={() => onSelectAnswer(orderedItems.map((o) => o.id))}
            >
              <span>OK</span>
            </button>
          )}
        </div>
      )}

      {/* Map */}
      {question.type === 'map' && question.mapSpec && (
        <PhysicalMap
          mapSpec={question.mapSpec}
          selectedPinId={typeof submittedResult?.selected === 'string' ? submittedResult.selected : null}
          correctPinId={String(question.answer)}
          isSubmitted={isLocked}
          onSelectPin={(pinId) => onSelectAnswer(pinId)}
        />
      )}

      {/* Compare */}
      {question.type === 'compare' && renderCompare()}
    </article>
  );
}
