import rawCards from './cards.json';
import type { TimelineCard } from '../game/types';
import { normalizeCards } from './normalizeCards';

export const loadCards = async (): Promise<TimelineCard[]> => {
  return Promise.resolve(normalizeCards(rawCards as unknown[]));
};
