import type { CSSProperties } from 'react';
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

  const normalizedDistance = Math.max(0, Math.min(3, distance));
  const scaleByDistance = [1, 0.9, 0.8, 0.7] as const;
  const opacityByDistance = [1, 0.95, 0.9, 0.84] as const;
  const scale = scaleByDistance[normalizedDistance];
  const opacity = opacityByDistance[normalizedDistance];
  const hoverDetails = card.description ?? '';
  const hoverText = hoverDetails.length > 0 ? `${card.title} (${card.year})\n\n${hoverDetails}` : `${card.title} (${card.year})`;

  return (
    <article
      className={classes.join(' ')}
      title={hoverText}
      style={
        {
          width: `${width}px`,
          minWidth: `${width}px`,
          '--focus-scale': scale,
          '--focus-opacity': opacity,
        } as CSSProperties
      }
    >
      <div className={styles.surface}>
        <h3 className={styles.title}>{card.title}</h3>
        <p className={styles.year}>{revealed ? card.year : '????'}</p>
      </div>
    </article>
  );
};
