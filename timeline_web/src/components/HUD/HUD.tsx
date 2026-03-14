import styles from './HUD.module.css';

type HUDProps = {
  deckCount: number;
  discardCount: number;
  mistakes: number;
  maxMistakes: number;
  score: number;
  turns: number;
  onRestart: () => void;
  onMenu: () => void;
};

export const HUD = ({
  deckCount,
  discardCount,
  mistakes,
  maxMistakes,
  score,
  turns,
  onRestart,
  onMenu,
}: HUDProps) => {
  return (
    <section className={styles.hud} aria-label="Game information">
      <p>
        Deck: <strong>{deckCount}</strong>
      </p>
      <p>
        Discard: <strong>{discardCount}</strong>
      </p>
      <p>
        Mistakes: <strong>{mistakes}</strong>/{maxMistakes}
      </p>
      <p>
        Score: <strong>{score}</strong>
      </p>
      <p>
        Turns: <strong>{turns}</strong>
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={onRestart}>
          Restart
        </button>
        <button type="button" onClick={onMenu}>
          Menu
        </button>
      </div>
    </section>
  );
};
