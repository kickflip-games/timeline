import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { getRouteForPhase } from './routes';
import { Card } from '../components/Card/Card';
import { DiscardStack } from '../components/DiscardStack/DiscardStack';
import { EndScreen } from '../components/EndScreen/EndScreen';
import { HUD } from '../components/HUD/HUD';
import { StartScreen } from '../components/StartScreen/StartScreen';
import { TimelineRow } from '../components/TimelineRow/TimelineRow';
import type { TimelineCard as TimelineCardType } from '../game/types';
import { useGame } from '../hooks/useGame';
import styles from './App.module.css';

type SnapAnimation = {
  card: TimelineCardType;
  from: { x: number; y: number };
  to: { x: number; y: number };
  size: { width: number; height: number };
  active: boolean;
};

function App() {
  const { state, cards, isLoading, error, startGame, placeCard, nextRound, restart } = useGame();
  const route = getRouteForPhase(state.phase);
  const snapTimerRef = useRef<number | null>(null);
  const handAreaRef = useRef<HTMLElement | null>(null);
  const [dragPointerId, setDragPointerId] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragCardSize, setDragCardSize] = useState<{ width: number; height: number }>({
    width: 300,
    height: 188,
  });
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [snapAnimation, setSnapAnimation] = useState<SnapAnimation | null>(null);
  const isDragging = dragPointerId !== null && dragPosition !== null;
  const canDragCard =
    route === 'game' && state.phase === 'playing' && Boolean(state.currentCard) && !snapAnimation;

  useEffect(() => {
    if (state.phase !== 'resolved') {
      return;
    }

    const timer = window.setTimeout(() => {
      nextRound();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [nextRound, state.phase]);

  useEffect(() => {
    if (state.phase !== 'playing') {
      setHoveredSlotIndex(null);
    }
  }, [state.phase]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const previous = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.userSelect = previous;
    };
  }, [isDragging]);

  useEffect(() => {
    return () => {
      if (snapTimerRef.current !== null) {
        window.clearTimeout(snapTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest('button');
      if (!target) {
        return;
      }
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      target.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
      target.classList.remove('ripple-active');
      void target.clientWidth;
      target.classList.add('ripple-active');
      window.setTimeout(() => target.classList.remove('ripple-active'), 450);
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    const orientation = window.screen.orientation as ScreenOrientation & {
      lock?: (orientation: 'portrait' | 'landscape') => Promise<void>;
    };
    if (typeof orientation?.lock !== 'function') {
      return;
    }
    if (!window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    orientation.lock('landscape').catch(() => {
      // Most mobile browsers reject lock unless in fullscreen/PWA mode.
    });
  }, []);

  const isPointInsideHandArea = (x: number, y: number): boolean => {
    const rect = handAreaRef.current?.getBoundingClientRect();
    if (!rect) {
      return false;
    }
    const pad = 18;
    return x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad;
  };

  const getHoveredSlotFromPoint = (
    x: number,
    y: number,
  ): { index: number; element: HTMLElement | null } | null => {
    if (isPointInsideHandArea(x, y)) {
      return null;
    }

    const element = document.elementFromPoint(x, y);
    const marker = element?.closest('[data-slot-marker-index]') as HTMLElement | null;
    if (!marker) {
      const markers = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot-marker-index]'),
      );
      if (markers.length === 0) {
        return null;
      }
      let nearest: { index: number; element: HTMLElement } | null = null;
      let minDistance = Number.POSITIVE_INFINITY;
      for (const candidate of markers) {
        const raw = candidate.dataset.slotMarkerIndex;
        if (!raw) {
          continue;
        }
        const index = Number(raw);
        if (Number.isNaN(index)) {
          continue;
        }
        const rect = candidate.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.hypot(x - cx, (y - cy) * 1.2);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { index, element: candidate };
        }
      }
      if (!nearest || minDistance > 170) {
        return null;
      }
      return nearest;
    }
    const rawIndex = marker.dataset.slotMarkerIndex;
    if (!rawIndex) {
      return null;
    }
    const parsed = Number(rawIndex);
    return Number.isNaN(parsed) ? null : { index: parsed, element: marker };
  };

  const onCurrentCardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canDragCard) {
      return;
    }
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setDragCardSize({ width: rect.width, height: rect.height });
    setDragPosition({ x: event.clientX, y: event.clientY });
    setDragPointerId(event.pointerId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onCurrentCardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragPointerId !== event.pointerId) {
      return;
    }
    setDragPosition({ x: event.clientX, y: event.clientY });
    setHoveredSlotIndex(getHoveredSlotFromPoint(event.clientX, event.clientY)?.index ?? null);
  };

  const onCurrentCardPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragPointerId !== event.pointerId) {
      return;
    }

    const dropped = getHoveredSlotFromPoint(event.clientX, event.clientY);
    const resolvedSlotIndex = dropped?.index ?? hoveredSlotIndex;
    if (resolvedSlotIndex !== null && state.phase === 'playing' && state.currentCard) {
      const from = {
        x: event.clientX - dragOffset.x,
        y: event.clientY - dragOffset.y,
      };
      const slotRect = dropped?.element?.getBoundingClientRect();
      const to = slotRect
        ? {
            x: slotRect.left + slotRect.width / 2 - dragCardSize.width / 2,
            y: slotRect.top + slotRect.height / 2 - dragCardSize.height / 2,
          }
        : from;

      setSnapAnimation({
        card: state.currentCard,
        from,
        to,
        size: dragCardSize,
        active: false,
      });

      requestAnimationFrame(() => {
        setSnapAnimation((current) => (current ? { ...current, active: true } : current));
      });

      snapTimerRef.current = window.setTimeout(() => {
        placeCard(resolvedSlotIndex);
        setSnapAnimation(null);
      }, 260);
    }

    setDragPointerId(null);
    setDragPosition(null);
    setHoveredSlotIndex(null);
  };

  if (isLoading) {
    return <main className={styles.shell}>Loading cards...</main>;
  }

  if (error) {
    return <main className={styles.shell}>Failed to load cards: {error}</main>;
  }

  const onMenu = () => {
    window.location.reload();
  };

  return (
    <main className={styles.shell}>
      <section className={styles.landscapeGate} aria-live="polite" aria-label="Landscape orientation required">
        <h2>Rotate Device</h2>
        <p>Timeline is optimized for landscape mode on mobile.</p>
        <p>Turn your phone sideways to continue.</p>
      </section>

      {route === 'start' ? (
        <StartScreen onStart={startGame} disabled={cards.length === 0} />
      ) : null}

      {route === 'game' ? (
        <div className={styles.gameGrid}>
          <section className={styles.header} aria-label="Header">
            <div className={styles.branding}>
              <h1>Timeline</h1>
              <p>Place each event in chronological order.</p>
            </div>
            <p className={styles.keyboardHint}>Arrow keys move slot, Enter places card.</p>
          </section>

          <section className={styles.timelineStage} aria-label="Timeline">
            <TimelineRow
              timeline={state.timeline}
              canInsert={state.phase === 'playing'}
              hoveredSlotIndex={hoveredSlotIndex}
              dragPreviewCard={isDragging ? state.currentCard : null}
              draggingCard={isDragging}
              onSelectInsertion={placeCard}
              lastResolution={state.lastResolution}
            />
          </section>

          <section className={styles.interactionRow}>
            <section ref={handAreaRef} className={styles.currentCardPanel} aria-label="Current card in hand">
              {state.currentCard ? (
                <div
                  className={styles.draggableCard}
                  onPointerDown={onCurrentCardPointerDown}
                  onPointerMove={onCurrentCardPointerMove}
                  onPointerUp={onCurrentCardPointerUp}
                  onPointerCancel={onCurrentCardPointerUp}
                >
                  <Card
                    card={state.currentCard}
                    className={isDragging ? styles.dragSource : undefined}
                    revealed={state.phase !== 'playing'}
                    highlighted={
                      state.lastResolution
                        ? state.lastResolution.isCorrect
                          ? 'correct'
                          : 'incorrect'
                        : null
                    }
                  />
                </div>
              ) : (
                <p className={styles.noCard}>No card in hand</p>
              )}
            </section>

            <section className={styles.wrongPile} aria-label="Wrong cards pile">
              <DiscardStack cards={state.discard} />
            </section>
          </section>

          <section className={styles.resolve} aria-live="polite">
            {state.phase === 'resolved' && state.lastResolution ? (
              <>
                <p>
                  {state.lastResolution.isCorrect
                    ? 'Correct placement.'
                    : `Incorrect. Correct slot was ${state.lastResolution.correctIndex + 1}.`}
                </p>
                <p className={styles.autoAdvance}>Advancing...</p>
              </>
            ) : null}
          </section>

          <section className={styles.footer} aria-label="Footer HUD">
            <HUD
              mistakes={state.mistakes}
              maxMistakes={state.maxMistakes}
              score={state.score}
              onRestart={restart}
              onMenu={onMenu}
            />
          </section>
        </div>
      ) : null}

      {route === 'end' ? (
        <EndScreen
          didWin={state.phase === 'won'}
          score={state.score}
          turns={state.turnCount}
          mistakes={state.mistakes}
          onRestart={restart}
          onMenu={onMenu}
        />
      ) : null}

      {isDragging && state.currentCard ? (
        <div
          className={styles.dragGhost}
          style={{
            left: dragPosition.x - dragOffset.x,
            top: dragPosition.y - dragOffset.y,
            width: dragCardSize.width,
            height: dragCardSize.height,
          }}
          aria-hidden="true"
        >
          <Card card={state.currentCard} revealed={false} />
        </div>
      ) : null}

      {snapAnimation ? (
        <div
          className={styles.snapGhost}
          style={{
            left: snapAnimation.from.x,
            top: snapAnimation.from.y,
            width: snapAnimation.size.width,
            height: snapAnimation.size.height,
            transform: snapAnimation.active
              ? `translate(${snapAnimation.to.x - snapAnimation.from.x}px, ${
                  snapAnimation.to.y - snapAnimation.from.y
                }px) scale(0.9)`
              : 'translate(0, 0) scale(1)',
          }}
          aria-hidden="true"
        >
          <Card card={snapAnimation.card} revealed={false} />
        </div>
      ) : null}
    </main>
  );
}

export default App;
