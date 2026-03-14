import type { TimelineCard } from '../../game/types';
import styles from './DiscardStack.module.css';

type DiscardStackProps = {
  cards: TimelineCard[];
};

export const DiscardStack = ({ cards }: DiscardStackProps) => {
  const preview = cards.slice(-4).reverse();

  return (
    <aside className={styles.stack} aria-label="Discard pile">
      <h3>Discard</h3>
      <p className={styles.count}>{cards.length} cards</p>
      <div className={styles.preview}>
        {preview.length === 0 ? <p className={styles.empty}>No discarded cards</p> : null}
        {preview.map((card, index) => (
          <article
            key={`${card.id}-${index}`}
            className={styles.card}
            style={{ transform: `translateY(${index * 8}px)` }}
            aria-label={`${card.title} discarded`}
          >
            <p>{card.title}</p>
            <span>{card.year}</span>
          </article>
        ))}
      </div>
    </aside>
  );
};
