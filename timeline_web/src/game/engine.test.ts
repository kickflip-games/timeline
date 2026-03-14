import { describe, expect, it } from 'vitest';
import { advanceAfterResolution, createGame, getCorrectInsertionIndex, resolveMove } from './engine';
import type { GameState, TimelineCard } from './types';

const makeCard = (id: string, year: number): TimelineCard => ({ id, title: id, year });

describe('getCorrectInsertionIndex', () => {
  const timeline = [
    { card: makeCard('a', 1900), revealed: true },
    { card: makeCard('b', 1950), revealed: true },
    { card: makeCard('c', 2000), revealed: true },
  ];

  it('inserts before first', () => {
    expect(getCorrectInsertionIndex(timeline, makeCard('x', 1800))).toBe(0);
  });

  it('inserts after last', () => {
    expect(getCorrectInsertionIndex(timeline, makeCard('x', 2020))).toBe(3);
  });

  it('inserts between cards', () => {
    expect(getCorrectInsertionIndex(timeline, makeCard('x', 1970))).toBe(2);
  });

  it('handles duplicate years by placing after equals', () => {
    expect(getCorrectInsertionIndex(timeline, makeCard('x', 1950))).toBe(2);
  });
});

const makeBaseState = (): GameState => ({
  phase: 'playing',
  timeline: [
    { card: makeCard('a', 1900), revealed: true },
    { card: makeCard('b', 2000), revealed: true },
  ],
  currentCard: makeCard('x', 1950),
  deck: [makeCard('y', 2010)],
  discard: [],
  mistakes: 0,
  maxMistakes: 3,
  lastResolution: null,
  turnCount: 0,
  score: 0,
  options: {
    initialTimelineSize: 2,
    maxMistakes: 3,
    deckSubsetSize: 10,
    insertOnIncorrect: false,
    scoreRule: 'correct_moves',
    randomSeed: 53,
  },
});

describe('resolveMove', () => {
  it('resolves correct move', () => {
    const next = resolveMove(makeBaseState(), 1);
    expect(next.lastResolution?.isCorrect).toBe(true);
    expect(next.timeline).toHaveLength(3);
    expect(next.discard).toHaveLength(0);
    expect(next.score).toBe(1);
    expect(next.phase).toBe('resolved');
  });

  it('resolves incorrect move', () => {
    const next = resolveMove(makeBaseState(), 0);
    expect(next.lastResolution?.isCorrect).toBe(false);
    expect(next.timeline).toHaveLength(2);
    expect(next.discard).toHaveLength(1);
    expect(next.mistakes).toBe(1);
    expect(next.phase).toBe('resolved');
  });

  it('can insert on incorrect when option is enabled', () => {
    const state = makeBaseState();
    state.options.insertOnIncorrect = true;
    const next = resolveMove(state, 0);
    expect(next.lastResolution?.isCorrect).toBe(false);
    expect(next.timeline).toHaveLength(3);
    expect(next.timeline[1].card.id).toBe('x');
  });

  it('marks loss when mistakes reaches max', () => {
    const state = makeBaseState();
    state.mistakes = 2;
    state.maxMistakes = 3;
    const next = resolveMove(state, 0);
    expect(next.phase).toBe('lost');
  });

  it('marks win when last card is resolved and deck is empty', () => {
    const state = makeBaseState();
    state.deck = [];
    const next = resolveMove(state, 1);
    expect(next.phase).toBe('won');
  });
});

describe('advanceAfterResolution', () => {
  it('draws next card and clears resolution', () => {
    const resolvedState = resolveMove(makeBaseState(), 1);
    const next = advanceAfterResolution(resolvedState);
    expect(next.phase).toBe('playing');
    expect(next.currentCard?.id).toBe('y');
    expect(next.lastResolution).toBeNull();
  });
});

describe('createGame', () => {
  it('creates deterministic game with seed', () => {
    const cards = [
      makeCard('a', 1900),
      makeCard('b', 1910),
      makeCard('c', 1920),
      makeCard('d', 1930),
      makeCard('e', 1940),
    ];
    const state = createGame(cards, { initialTimelineSize: 2, deckSubsetSize: 5, randomSeed: 1 });
    expect(state.timeline).toHaveLength(2);
    expect(state.currentCard).not.toBeNull();
    expect(state.phase).toBe('playing');
  });
});
