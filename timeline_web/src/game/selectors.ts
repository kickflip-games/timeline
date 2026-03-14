import type { GameState } from './types';

export const getDeckCount = (state: GameState): number => state.deck.length;

export const getDiscardCount = (state: GameState): number => state.discard.length;

export const getLivesRemaining = (state: GameState): number => {
  return Math.max(0, state.maxMistakes - state.mistakes);
};
