import { useLayoutEffect, useState, RefObject } from 'react';

export interface TimelineItem {
  id: string;
  releaseDate: string;
}

export interface PositionData {
  left: string;
  top: string;
}

/**
 * Custom hook for positioning items along a timeline based on their release dates
 *
 * @param items Array of items with release dates to position on the timeline
 * @param containerRef Reference to the timeline container element
 * @param options Configuration options for positioning
 * @returns Object with positioned items mapped by their IDs
 */
export function useTimelinePositioning<T extends TimelineItem>(
  items: T[],
  containerRef: RefObject<HTMLElement>,
  options: {
    startDate?: string;
    endDate?: string;
    verticalSpacing?: number;
    verticalLanes?: number;
    horizontalPadding?: number;
  } = {}
) {
  const [positions, setPositions] = useState<Record<string, PositionData>>({});

  // Use layout effect to ensure we calculate positions before paint
  useLayoutEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;

    // Default options
    const {
      startDate = items.reduce(
        (earliest, item) =>
          new Date(item.releaseDate) < new Date(earliest)
            ? item.releaseDate
            : earliest,
        items[0].releaseDate
      ),
      endDate = items.reduce(
        (latest, item) =>
          new Date(item.releaseDate) > new Date(latest)
            ? item.releaseDate
            : latest,
        items[0].releaseDate
      ),
      verticalSpacing = 80,
      verticalLanes = 3,
      horizontalPadding = 5, // percentage
    } = options;

    // Timeline range in milliseconds
    const timelineStart = new Date(startDate).getTime();
    const timelineEnd = new Date(endDate).getTime();
    const timelineRange = timelineEnd - timelineStart;

    // Ensure the range is at least one day to avoid division by zero
    const safeRange = timelineRange > 0 ? timelineRange : 24 * 60 * 60 * 1000;

    // Usable width after padding
    const usableWidthPercentage = 100 - horizontalPadding * 2;

    // Calculate positions
    const newPositions: Record<string, PositionData> = {};

    // Track vertical positions to avoid overlaps
    const verticalPositions: number[] = Array(verticalLanes).fill(0);

    items.forEach((item, index) => {
      const itemDate = new Date(item.releaseDate).getTime();

      // Calculate horizontal position (percentage of timeline)
      const position = (itemDate - timelineStart) / safeRange;
      const horizontalPosition =
        horizontalPadding + position * usableWidthPercentage;

      // Find the best vertical lane (one with most space)
      const laneIndex = index % verticalLanes;

      // Calculate vertical position
      const verticalPosition = laneIndex * verticalSpacing;

      // Store position data
      newPositions[item.id] = {
        left: `${horizontalPosition}%`,
        top: `${verticalPosition}px`,
      };

      // Update vertical position for this lane
      verticalPositions[laneIndex] += verticalSpacing;
    });

    setPositions(newPositions);
  }, [items, containerRef.current?.clientWidth]);

  return positions;
}

export default useTimelinePositioning; 