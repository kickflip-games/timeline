import type { GamePhase } from '../game/types';

export type AppRoute = 'start' | 'game' | 'end';

export const getRouteForPhase = (phase: GamePhase): AppRoute => {
  if (phase === 'start') {
    return 'start';
  }
  if (phase === 'won' || phase === 'lost') {
    return 'end';
  }
  return 'game';
};
