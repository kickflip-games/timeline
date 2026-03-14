import type { GameState, TimelineCard } from './types';

export const ensureEnoughCards = (cards: TimelineCard[], initialTimelineSize: number): void => {
  const minimum = initialTimelineSize + 1;
  if (cards.length < minimum) {
    throw new Error(`Need at least ${minimum} cards but received ${cards.length}`);
  }
};

export const isTerminalState = (state: GameState): boolean => {
  return state.phase === 'won' || state.phase === 'lost';
};
