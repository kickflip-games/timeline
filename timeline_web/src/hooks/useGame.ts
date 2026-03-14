import { useEffect, useMemo, useReducer } from 'react';
import { loadCards } from '../data/loadCards';
import { advanceAfterResolution, createGame, resolveMove, restartGame } from '../game/engine';
import { DEFAULT_GAME_OPTIONS } from '../game/constants';
import type { GameAction, GameOptions, GameState, TimelineCard } from '../game/types';

const createInitialState = (options: GameOptions): GameState => ({
  phase: 'start',
  timeline: [],
  currentCard: null,
  deck: [],
  discard: [],
  mistakes: 0,
  maxMistakes: options.maxMistakes,
  lastResolution: null,
  turnCount: 0,
  score: 0,
  options,
});

type UseGameState = {
  cards: TimelineCard[];
  state: GameState;
  isLoading: boolean;
  error: string | null;
};

type InternalAction =
  | GameAction
  | { type: 'CARDS_LOADED'; cards: TimelineCard[] }
  | { type: 'LOAD_FAILED'; error: string };

const reducer = (gameOptions: GameOptions) => (current: UseGameState, action: InternalAction): UseGameState => {
  switch (action.type) {
    case 'CARDS_LOADED':
      return {
        ...current,
        cards: action.cards,
        isLoading: false,
      };
    case 'LOAD_FAILED':
      return {
        ...current,
        isLoading: false,
        error: action.error,
      };
    case 'START_GAME':
      return {
        ...current,
        state: createGame(current.cards, gameOptions),
      };
    case 'PLACE_CARD':
      return {
        ...current,
        state: resolveMove(current.state, action.chosenIndex),
      };
    case 'NEXT_ROUND':
      return {
        ...current,
        state: advanceAfterResolution(current.state),
      };
    case 'RESTART_GAME':
      return {
        ...current,
        state: restartGame(current.cards, gameOptions),
      };
    default:
      return current;
  }
};

export const useGame = (options?: Partial<GameOptions>) => {
  const mergedOptions = useMemo(() => ({ ...DEFAULT_GAME_OPTIONS, ...options }), [options]);

  const [state, dispatch] = useReducer(reducer(mergedOptions), {
    cards: [],
    state: createInitialState(mergedOptions),
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const cards = await loadCards();
        if (!cancelled) {
          dispatch({ type: 'CARDS_LOADED', cards });
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Failed to load cards.';
          dispatch({ type: 'LOAD_FAILED', error: message });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...state,
    startGame: () => dispatch({ type: 'START_GAME' }),
    placeCard: (chosenIndex: number) => dispatch({ type: 'PLACE_CARD', chosenIndex }),
    nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
    restart: () => dispatch({ type: 'RESTART_GAME' }),
  };
};
