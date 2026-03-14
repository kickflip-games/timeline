export type TimelineCard = {
  id: string;
  title: string;
  year: number;
  description?: string;
  imageUrl?: string;
  category?: string;
};

export type PlacedCard = {
  card: TimelineCard;
  revealed: boolean;
};

export type GamePhase = 'start' | 'playing' | 'resolved' | 'won' | 'lost';

export type MoveResolution = {
  chosenIndex: number;
  correctIndex: number;
  isCorrect: boolean;
};

export type ScoreRule = 'correct_moves';

export type GameOptions = {
  initialTimelineSize: number;
  maxMistakes: number;
  deckSubsetSize: number;
  insertOnIncorrect: boolean;
  scoreRule: ScoreRule;
  randomSeed?: number;
};

export type GameState = {
  phase: GamePhase;
  timeline: PlacedCard[];
  currentCard: TimelineCard | null;
  deck: TimelineCard[];
  discard: TimelineCard[];
  mistakes: number;
  maxMistakes: number;
  lastResolution: MoveResolution | null;
  turnCount: number;
  score: number;
  options: GameOptions;
};

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PLACE_CARD'; chosenIndex: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART_GAME' };
