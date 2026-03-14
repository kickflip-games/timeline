import styles from './InsertionSlot.module.css';

type InsertionSlotProps = {
  index: number;
  disabled: boolean;
  onSelect: (index: number) => void;
};

export const InsertionSlot = ({ index, disabled, onSelect }: InsertionSlotProps) => {
  return (
    <button
      type="button"
      className={styles.slot}
      aria-label={`Insert card at position ${index + 1}`}
      onClick={() => onSelect(index)}
      disabled={disabled}
    >
      <span className={styles.pin} aria-hidden="true" />
      <span className={styles.label}>{index + 1}</span>
    </button>
  );
};
