import type { TimelineCard } from '../../game/types';
import styles from './DiscardStack.module.css';

type DiscardStackProps = {
  cards: TimelineCard[];
};

export const DiscardStack = ({ cards }: DiscardStackProps) => {
  const preview = cards.slice(-4).reverse();

  return (
    <aside className={styles.stack} aria-label="Wrong cards pile">
      <h3>Wrong Pile</h3>
      <p className={styles.count}>{cards.length} wrong card{cards.length === 1 ? '' : 's'}</p>
      <div className={styles.preview}>
        {preview.length === 0 ? <p className={styles.empty}>No wrong cards yet</p> : null}
        {preview.map((card, index) => (
          <article
            key={`${card.id}-${index}`}
            className={styles.card}
            style={{ transform: `translateY(${index * 8}px)` }}
            aria-label={`${card.title} in wrong pile`}
          >
            <p>{card.title}</p>
            <span>{card.year}</span>
          </article>
        ))}
      </div>
    </aside>
  );
};
