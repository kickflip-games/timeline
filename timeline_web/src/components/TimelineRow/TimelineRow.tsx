import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { clamp } from '../../utils/clamp';
import type { MoveResolution, PlacedCard, TimelineCard as TimelineCardType } from '../../game/types';
import { TimelineTrack } from '../TimelineTrack/TimelineTrack';
import { TimelineViewport } from '../TimelineViewport/TimelineViewport';
import styles from './TimelineRow.module.css';

type TimelineRowProps = {
  timeline: PlacedCard[];
  canInsert: boolean;
  hoveredSlotIndex?: number | null;
  dragPreviewCard?: TimelineCardType | null;
  draggingCard?: boolean;
  onSelectInsertion: (index: number) => void;
  lastResolution: MoveResolution | null;
};

type LayoutMetrics = {
  cardWidth: number;
  slotWidth: number;
  gap: number;
};

const getLayoutMetrics = (viewportWidth: number): LayoutMetrics => {
  if (viewportWidth < 520) {
    return { cardWidth: 120, slotWidth: 28, gap: 12 };
  }
  if (viewportWidth < 860) {
    return { cardWidth: 148, slotWidth: 32, gap: 16 };
  }
  return { cardWidth: 180, slotWidth: 36, gap: 20 };
};

const computeGeometry = (timelineLength: number, metrics: LayoutMetrics) => {
  const { cardWidth, slotWidth, gap } = metrics;
  const slotCount = timelineLength + 1;

  const slotCenters: number[] = [];
  let cursor = 0;

  for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
    slotCenters.push(cursor + slotWidth / 2);
    cursor += slotWidth;

    if (slotIndex < timelineLength) {
      cursor += gap;
      cursor += cardWidth;
      cursor += gap;
    }
  }

  return { slotCount, slotCenters, trackWidth: cursor };
};

export const TimelineRow = ({
  timeline,
  canInsert,
  hoveredSlotIndex = null,
  dragPreviewCard = null,
  draggingCard = false,
  onSelectInsertion,
  lastResolution,
}: TimelineRowProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef(0);
  const dragLastXRef = useRef(0);
  const dragLastTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const dragPointerIdRef = useRef<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(720);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  useEffect(() => {
    const update = () => {
      const width = viewportRef.current?.clientWidth ?? 720;
      setViewportWidth(width);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const metrics = useMemo(() => getLayoutMetrics(viewportWidth), [viewportWidth]);
  const geometry = useMemo(() => computeGeometry(timeline.length, metrics), [timeline.length, metrics]);

  useEffect(() => {
    setSelectedSlotIndex((current) => clamp(current, 0, geometry.slotCount - 1));
  }, [geometry.slotCount]);

  useEffect(() => {
    if (lastResolution) {
      setSelectedSlotIndex(lastResolution.chosenIndex);
    }
  }, [lastResolution]);

  useEffect(() => {
    if (!canInsert) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedSlotIndex((current) => clamp(current - 1, 0, geometry.slotCount - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedSlotIndex((current) => clamp(current + 1, 0, geometry.slotCount - 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onSelectInsertion(selectedSlotIndex);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canInsert, geometry.slotCount, onSelectInsertion, selectedSlotIndex]);

  if (timeline.length === 0) {
    return (
      <section className={styles.wrap} aria-label="Timeline">
        <header className={styles.labels}>
          <span>Past</span>
          <span>Future</span>
        </header>
        <p className={styles.empty}>Timeline is empty.</p>
      </section>
    );
  }

  const focusSlotIndex = hoveredSlotIndex !== null ? hoveredSlotIndex : selectedSlotIndex;
  const selectedSlotCenter = geometry.slotCenters[focusSlotIndex] ?? geometry.slotCenters[selectedSlotIndex] ?? 0;
  const viewportCenter = viewportWidth / 2;
  const scrollable = geometry.trackWidth > viewportWidth;
  const centeredTrackOffset = (viewportWidth - geometry.trackWidth) / 2;
  const minOffset = scrollable ? viewportWidth - geometry.trackWidth : centeredTrackOffset;
  const maxOffset = scrollable ? 0 : centeredTrackOffset;
  const rawOffset = viewportCenter - selectedSlotCenter;
  const baseOffset = scrollable ? clamp(rawOffset, minOffset, maxOffset) : centeredTrackOffset;

  const applyResistance = (value: number): number => {
    if (!scrollable) {
      return centeredTrackOffset;
    }
    if (value < minOffset) {
      return minOffset - (minOffset - value) * 0.35;
    }
    if (value > maxOffset) {
      return maxOffset + (value - maxOffset) * 0.35;
    }
    return value;
  };

  const offsetX = isDragging ? applyResistance(baseOffset + dragOffsetX) : baseOffset;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canInsert || draggingCard || !scrollable) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    setIsDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragPointerIdRef.current !== event.pointerId) {
      return;
    }
    const now = performance.now();
    const dx = event.clientX - dragLastXRef.current;
    const dt = Math.max(1, now - dragLastTimeRef.current);
    const instantVelocity = dx / dt;
    dragVelocityRef.current = dragVelocityRef.current * 0.7 + instantVelocity * 0.3;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = now;
    setDragOffsetX(event.clientX - dragStartXRef.current);
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    const dragDelta = event.clientX - dragStartXRef.current;
    const inertiaDistance = dragVelocityRef.current * 160;
    const settledOffset = clamp(baseOffset + dragDelta + inertiaDistance, minOffset, maxOffset);
    const focusLine = viewportCenter - settledOffset;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < geometry.slotCenters.length; index += 1) {
      const distance = Math.abs(geometry.slotCenters[index] - focusLine);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    if (nearestIndex === selectedSlotIndex && Math.abs(dragDelta) > 24) {
      const direction = dragDelta < 0 ? 1 : -1;
      nearestIndex = clamp(selectedSlotIndex + direction, 0, geometry.slotCount - 1);
    }

    setSelectedSlotIndex(nearestIndex);
    setDragOffsetX(0);
    setIsDragging(false);
    dragVelocityRef.current = 0;
    dragPointerIdRef.current = null;
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!canInsert || draggingCard || !scrollable) {
      return;
    }
    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 4) {
      return;
    }
    event.preventDefault();
    setSelectedSlotIndex((current) =>
      clamp(current + (dominantDelta > 0 ? 1 : -1), 0, geometry.slotCount - 1),
    );
  };

  return (
    <section className={styles.wrap} aria-label="Timeline">
      <header className={styles.labels}>
        <span>Past</span>
        <span>Future</span>
      </header>

      <div ref={viewportRef} className={styles.viewportWrap} onWheel={onWheel}>
        <TimelineViewport
          offsetX={offsetX}
          trackWidth={geometry.trackWidth}
          isDragging={isDragging}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <TimelineTrack
            timeline={timeline}
            selectedSlotIndex={selectedSlotIndex}
            hoveredSlotIndex={hoveredSlotIndex}
            dragPreviewCard={dragPreviewCard}
            canInsert={canInsert}
            cardWidth={metrics.cardWidth}
            slotWidth={metrics.slotWidth}
            gap={metrics.gap}
            lastResolution={lastResolution}
            onSelectSlot={setSelectedSlotIndex}
          />
        </TimelineViewport>
      </div>

      <div className={styles.mobilePlace}>
        <button
          type="button"
          className={styles.placeButton}
          onClick={() => onSelectInsertion(selectedSlotIndex)}
          disabled={!canInsert}
          aria-label={`Place card at position ${selectedSlotIndex + 1}`}
        >
          Place Here ({selectedSlotIndex + 1} / {geometry.slotCount})
        </button>
      </div>
    </section>
  );
};
