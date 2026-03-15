import type { TimelineCard } from '../../game/types';
import { formatYear } from '../../utils/formatYear';
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
        {preview.map((card, index) => {
          const displayYear = formatYear(card.year);

          return (
          <article
            key={`${card.id}-${index}`}
            className={styles.card}
            style={{ transform: `translateY(${index * 8}px)` }}
            aria-label={`${card.title} in wrong pile`}
            title={card.description ? `${card.title} (${displayYear})\n\n${card.description}` : `${card.title} (${displayYear})`}
          >
            <p>{card.title}</p>
            <span>{displayYear}</span>
          </article>
          );
        })}
      </div>
    </aside>
  );
};
