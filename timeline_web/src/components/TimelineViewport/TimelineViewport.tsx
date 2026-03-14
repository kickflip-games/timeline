import { type ReactNode } from 'react';
import styles from './TimelineViewport.module.css';

type TimelineViewportProps = {
  offsetX: number;
  trackWidth: number;
  isDragging?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLDivElement>) => void;
  children: ReactNode;
};

export const TimelineViewport = ({
  offsetX,
  trackWidth,
  isDragging = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  children,
}: TimelineViewportProps) => {
  return (
    <div
      className={styles.viewport}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className={`${styles.track} ${isDragging ? styles.dragging : ''}`}
        style={{ transform: `translateX(${offsetX}px)`, width: `${trackWidth}px` }}
      >
        {children}
      </div>
    </div>
  );
};
