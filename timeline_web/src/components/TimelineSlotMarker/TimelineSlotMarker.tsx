import styles from './TimelineSlotMarker.module.css';

type TimelineSlotMarkerProps = {
  index: number;
  selected: boolean;
  hovered: boolean;
  disabled: boolean;
  isCorrectSlot: boolean;
  wasChosenSlot: boolean;
  onSelect: (index: number) => void;
  width: number;
};

export const TimelineSlotMarker = ({
  index,
  selected,
  hovered,
  disabled,
  isCorrectSlot,
  wasChosenSlot,
  onSelect,
  width,
}: TimelineSlotMarkerProps) => {
  const classes = [styles.marker];
  if (selected) classes.push(styles.selected);
  if (hovered) classes.push(styles.hovered);
  if (isCorrectSlot) classes.push(styles.correct);
  if (wasChosenSlot && !isCorrectSlot) classes.push(styles.chosenWrong);

  return (
    <button
      type="button"
      className={classes.join(' ')}
      style={{ width: `${width}px`, minWidth: `${width}px` }}
      onClick={() => onSelect(index)}
      disabled={disabled}
      aria-label={`Select insertion position ${index + 1}`}
      aria-current={selected ? 'true' : undefined}
      data-slot-marker-index={index}
    >
      <span className={styles.tick} aria-hidden="true" />
    </button>
  );
};
