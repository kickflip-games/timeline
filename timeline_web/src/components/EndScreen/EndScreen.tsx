import styles from './EndScreen.module.css';

type EndScreenProps = {
  didWin: boolean;
  score: number;
  turns: number;
  mistakes: number;
  onRestart: () => void;
  onMenu: () => void;
};

export const EndScreen = ({ didWin, score, turns, mistakes, onRestart, onMenu }: EndScreenProps) => {
  return (
    <section className={styles.end} aria-label="End screen">
      <h2>{didWin ? 'You Won' : 'You Lost'}</h2>
      <p>Score: {score}</p>
      <p>Turns: {turns}</p>
      <p>Mistakes: {mistakes}</p>
      <div className={styles.actions}>
        <button type="button" onClick={onRestart}>
          Play Again
        </button>
        <button type="button" onClick={onMenu}>
          Back to Menu
        </button>
      </div>
    </section>
  );
};
