import styles from './PlacementControls.module.css';

type PlacementControlsProps = {
  selectedSlotIndex: number;
  slotCount: number;
  canInsert: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
};

export const PlacementControls = ({
  selectedSlotIndex,
  slotCount,
  canInsert,
  onMoveLeft,
  onMoveRight,
}: PlacementControlsProps) => {
  return (
    <section className={styles.controls} aria-label="Placement controls">
      <button
        type="button"
        onClick={onMoveLeft}
        disabled={!canInsert || selectedSlotIndex === 0}
        aria-label="Move selected insertion position left"
      >
        Move Left
      </button>
      <p className={styles.positionLabel}>
        Position {selectedSlotIndex + 1} / {slotCount}
      </p>
      <button
        type="button"
        onClick={onMoveRight}
        disabled={!canInsert || selectedSlotIndex === slotCount - 1}
        aria-label="Move selected insertion position right"
      >
        Move Right
      </button>
    </section>
  );
};
