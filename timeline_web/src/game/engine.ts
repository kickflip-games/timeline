import { createRandomSeed, createSeededRandom } from '../utils/random';
import { shuffle } from '../utils/shuffle';
import { clamp } from '../utils/clamp';
import { DEFAULT_GAME_OPTIONS } from './constants';
import { buildGameOptions, sanitizeDeck } from './setup';
import type { GameOptions, GameState, PlacedCard, TimelineCard } from './types';
import { ensureEnoughCards } from './validation';

const scoreForCorrectMove = (state: GameState): number => {
  if (state.options.scoreRule === 'correct_moves') {
    return state.score + 1;
  }
  return state.score;
};

export const getCorrectInsertionIndex = (
  timeline: PlacedCard[],
  card: TimelineCard,
): number => {
  let index = 0;
  while (index < timeline.length && timeline[index].card.year <= card.year) {
    index += 1;
  }
  return index;
};

const drawNextCard = (deck: TimelineCard[]): { next: TimelineCard | null; rest: TimelineCard[] } => {
  if (deck.length === 0) {
    return { next: null, rest: [] };
  }
  const [next, ...rest] = deck;
  return { next, rest };
};

export const createGame = (
  cards: TimelineCard[],
  options?: Partial<GameOptions>,
): GameState => {
  const resolvedOptions = buildGameOptions(options);
  const seed = resolvedOptions.randomSeed ?? createRandomSeed();
  const finalizedOptions: GameOptions = { ...resolvedOptions, randomSeed: seed };

  ensureEnoughCards(cards, finalizedOptions.initialTimelineSize);

  const random = createSeededRandom(seed);
  const shuffledCards = shuffle(cards, random);
  const deckPool = sanitizeDeck(shuffledCards, finalizedOptions);

  ensureEnoughCards(deckPool, finalizedOptions.initialTimelineSize);

  const seedCards = deckPool
    .slice(0, finalizedOptions.initialTimelineSize)
    .sort((a, b) => a.year - b.year)
    .map((card): PlacedCard => ({ card, revealed: true }));

  const playableCards = deckPool.slice(finalizedOptions.initialTimelineSize);
  const { next, rest } = drawNextCard(playableCards);

  return {
    phase: next ? 'playing' : 'won',
    timeline: seedCards,
    currentCard: next,
    deck: rest,
    discard: [],
    mistakes: 0,
    maxMistakes: resolvedOptions.maxMistakes,
    lastResolution: null,
    turnCount: 0,
    score: 0,
    options: finalizedOptions,
  };
};

export const resolveMove = (state: GameState, chosenIndex: number): GameState => {
  if (state.phase !== 'playing' || !state.currentCard) {
    return state;
  }

  const boundedIndex = clamp(chosenIndex, 0, state.timeline.length);
  const card = state.currentCard;
  const correctIndex = getCorrectInsertionIndex(state.timeline, card);
  const isCorrect = boundedIndex === correctIndex;

  let timeline = state.timeline;
  let discard = state.discard;
  let mistakes = state.mistakes;
  let score = state.score;

  if (isCorrect) {
    const inserted: PlacedCard = { card, revealed: true };
    timeline = [
      ...state.timeline.slice(0, boundedIndex),
      inserted,
      ...state.timeline.slice(boundedIndex),
    ];
    score = scoreForCorrectMove(state);
  } else {
    mistakes += 1;
    discard = [...state.discard, card];
    if (state.options.insertOnIncorrect) {
      const inserted: PlacedCard = { card, revealed: true };
      timeline = [
        ...state.timeline.slice(0, correctIndex),
        inserted,
        ...state.timeline.slice(correctIndex),
      ];
    }
  }

  let phase: GameState['phase'] = 'resolved';
  if (mistakes >= state.maxMistakes) {
    phase = 'lost';
  } else if (state.deck.length === 0) {
    phase = 'won';
  }

  return {
    ...state,
    phase,
    timeline,
    currentCard: card,
    discard,
    mistakes,
    score,
    turnCount: state.turnCount + 1,
    lastResolution: {
      chosenIndex: boundedIndex,
      correctIndex,
      isCorrect,
    },
  };
};

export const advanceAfterResolution = (state: GameState): GameState => {
  if (state.phase !== 'resolved') {
    return state;
  }

  const { next, rest } = drawNextCard(state.deck);

  return {
    ...state,
    phase: next ? 'playing' : 'won',
    currentCard: next,
    deck: rest,
    lastResolution: null,
  };
};

export const restartGame = (
  cards: TimelineCard[],
  options?: Partial<GameOptions>,
): GameState => {
  return createGame(cards, options ?? DEFAULT_GAME_OPTIONS);
};
