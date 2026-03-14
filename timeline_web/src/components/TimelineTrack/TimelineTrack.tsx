import type { MoveResolution, PlacedCard, TimelineCard as TimelineCardType } from '../../game/types';
import { TimelineCard } from '../TimelineCard/TimelineCard';
import { TimelineSlotMarker } from '../TimelineSlotMarker/TimelineSlotMarker';
import styles from './TimelineTrack.module.css';

type TimelineTrackProps = {
  timeline: PlacedCard[];
  selectedSlotIndex: number;
  hoveredSlotIndex: number | null;
  dragPreviewCard: TimelineCardType | null;
  canInsert: boolean;
  slotWidth: number;
  cardWidth: number;
  gap: number;
  lastResolution: MoveResolution | null;
  onSelectSlot: (index: number) => void;
};

export const TimelineTrack = ({
  timeline,
  selectedSlotIndex,
  hoveredSlotIndex,
  dragPreviewCard,
  canInsert,
  slotWidth,
  cardWidth,
  gap,
  lastResolution,
  onSelectSlot,
}: TimelineTrackProps) => {
  return (
    <div className={styles.track} style={{ gap: `${gap}px` }}>
      {timeline.map((placed, cardIndex) => {
        const slotIndex = cardIndex;
        const distance = Math.min(
          Math.abs(selectedSlotIndex - cardIndex),
          Math.abs(selectedSlotIndex - (cardIndex + 1)),
        );

        return (
          <div key={`segment-${placed.card.id}-${cardIndex}`} className={styles.segment} style={{ gap: `${gap}px` }}>
            <TimelineSlotMarker
              index={slotIndex}
              selected={selectedSlotIndex === slotIndex}
              hovered={hoveredSlotIndex === slotIndex}
              disabled={!canInsert}
              width={slotWidth}
              isCorrectSlot={Boolean(lastResolution && !lastResolution.isCorrect && lastResolution.correctIndex === slotIndex)}
              wasChosenSlot={Boolean(lastResolution && lastResolution.chosenIndex === slotIndex)}
              onSelect={onSelectSlot}
            />
            {dragPreviewCard && hoveredSlotIndex === slotIndex ? (
              <TimelineCard
                card={dragPreviewCard}
                revealed={false}
                preview
                distance={0}
                width={cardWidth}
              />
            ) : null}
            <TimelineCard card={placed.card} revealed={placed.revealed} distance={distance} width={cardWidth} />
          </div>
        );
      })}

      <TimelineSlotMarker
        index={timeline.length}
        selected={selectedSlotIndex === timeline.length}
        hovered={hoveredSlotIndex === timeline.length}
        disabled={!canInsert}
        width={slotWidth}
        isCorrectSlot={Boolean(
          lastResolution && !lastResolution.isCorrect && lastResolution.correctIndex === timeline.length,
        )}
        wasChosenSlot={Boolean(lastResolution && lastResolution.chosenIndex === timeline.length)}
        onSelect={onSelectSlot}
      />
      {dragPreviewCard && hoveredSlotIndex === timeline.length ? (
        <TimelineCard card={dragPreviewCard} revealed={false} preview distance={0} width={cardWidth} />
      ) : null}
    </div>
  );
};
