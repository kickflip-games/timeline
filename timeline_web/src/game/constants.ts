import type { GameOptions } from './types';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  initialTimelineSize: 1,
  maxMistakes: 3,
  deckSubsetSize: 30,
  insertOnIncorrect: false,
  scoreRule: 'correct_moves',
};
