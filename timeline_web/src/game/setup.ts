import { DEFAULT_GAME_OPTIONS } from './constants';
import type { GameOptions, TimelineCard } from './types';

export const buildGameOptions = (options?: Partial<GameOptions>): GameOptions => {
  return {
    ...DEFAULT_GAME_OPTIONS,
    ...options,
  };
};

export const sanitizeDeck = (cards: TimelineCard[], options: GameOptions): TimelineCard[] => {
  return cards.slice(0, Math.min(options.deckSubsetSize, cards.length));
};
