import styles from './StartScreen.module.css';

type StartScreenProps = {
  onStart: () => void;
  disabled?: boolean;
};

export const StartScreen = ({ onStart, disabled = false }: StartScreenProps) => {
  return (
    <section className={styles.start} aria-label="Start screen">
      <h1>Timeline</h1>
      <p>
        Place each event into the correct position between Past and Future. Tap a slot to commit your move.
      </p>
      <button type="button" onClick={onStart} disabled={disabled}>
        Play
      </button>
    </section>
  );
};
