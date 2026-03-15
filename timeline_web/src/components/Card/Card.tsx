import type { TimelineCard } from '../../game/types';
import { formatYear } from '../../utils/formatYear';
import styles from './Card.module.css';

type CardProps = {
  card: TimelineCard;
  revealed?: boolean;
  highlighted?: 'correct' | 'incorrect' | null;
  className?: string;
};

export const Card = ({ card, revealed = true, highlighted = null, className }: CardProps) => {
  const classes = [styles.card, className];
  if (highlighted === 'correct') {
    classes.push(styles.correct);
  }
  if (highlighted === 'incorrect') {
    classes.push(styles.incorrect);
  }

  return (
    <article className={classes.filter(Boolean).join(' ')}>
      <h3 className={styles.title}>{card.title}</h3>
      <p className={`${styles.year} ${revealed ? styles.revealedYear : ''}`}>{revealed ? formatYear(card.year) : '????'}</p>
    </article>
  );
};
