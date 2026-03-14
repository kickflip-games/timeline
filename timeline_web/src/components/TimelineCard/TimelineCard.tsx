import type { TimelineCard as TimelineCardType } from '../../game/types';
import styles from './TimelineCard.module.css';

type TimelineCardProps = {
  card: TimelineCardType;
  revealed: boolean;
  distance: number;
  width: number;
  preview?: boolean;
};

export const TimelineCard = ({ card, revealed, distance, width, preview = false }: TimelineCardProps) => {
  const classes = [styles.card];
  if (preview) {
    classes.push(styles.preview);
  }
  if (distance >= 2) {
    classes.push(styles.distant);
  } else if (distance >= 1) {
    classes.push(styles.near);
  }

  return (
    <article className={classes.join(' ')} style={{ width: `${width}px`, minWidth: `${width}px` }}>
      <h3 className={styles.title}>{card.title}</h3>
      <p className={styles.year}>{revealed ? card.year : '????'}</p>
    </article>
  );
};
