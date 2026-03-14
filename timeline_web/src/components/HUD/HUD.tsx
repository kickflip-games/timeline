import styles from './HUD.module.css';

type HUDProps = {
  mistakes: number;
  maxMistakes: number;
  score: number;
  onRestart: () => void;
  onMenu: () => void;
};

export const HUD = ({
  mistakes,
  maxMistakes,
  score,
  onRestart,
  onMenu,
}: HUDProps) => {
  return (
    <section className={styles.hud} aria-label="Game information">
      <p>
        Mistakes: <strong>{mistakes}</strong>/{maxMistakes}
      </p>
      <p>
        Score: <strong>{score}</strong>
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
