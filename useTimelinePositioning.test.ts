import { renderHook } from "@testing-library/react";
import useTimelinePositioning from "./useTimelinePositioning";

describe("useTimelinePositioning", () => {
  const mockItems = [
    { id: "1", releaseDate: "2024-01-15" },
    { id: "2", releaseDate: "2024-02-20" },
    { id: "3", releaseDate: "2024-01-20" },
  ];

  const mockContainerRef = {
    current: {
      offsetWidth: 1000,
      offsetHeight: 500,
    },
  };

  test("returns positions for all items", () => {
    const { result } = renderHook(() =>
      useTimelinePositioning(mockItems, mockContainerRef)
    );

    expect(result.current.positions).toHaveLength(mockItems.length);
    result.current.positions.forEach((position) => {
      expect(position).toHaveProperty("id");
      expect(position).toHaveProperty("left");
      expect(position).toHaveProperty("top");
    });
  });

  test("positions items chronologically from left to right", () => {
    const { result } = renderHook(() =>
      useTimelinePositioning(mockItems, mockContainerRef)
    );

    const positions = result.current.positions;
    const item1Position = positions.find((p) => p.id === "1");
    const item2Position = positions.find((p) => p.id === "2");
    const item3Position = positions.find((p) => p.id === "3");

    expect(item1Position.left).toBeLessThan(item3Position.left);
    expect(item3Position.left).toBeLessThan(item2Position.left);
  });

  test("avoids vertical overlaps by adjusting top positions", () => {
    const { result } = renderHook(() =>
      useTimelinePositioning(mockItems, mockContainerRef)
    );

    const positions = result.current.positions;
    const usedTopPositions = positions.map((p) => p.top);
    const uniqueTopPositions = new Set(usedTopPositions);

    // Each item should have a unique top position to avoid overlaps
    expect(uniqueTopPositions.size).toBe(positions.length);
  });

  test("respects container boundaries", () => {
    const { result } = renderHook(() =>
      useTimelinePositioning(mockItems, mockContainerRef)
    );

    result.current.positions.forEach((position) => {
      expect(position.left).toBeGreaterThanOrEqual(0);
      expect(position.left).toBeLessThanOrEqual(
        mockContainerRef.current.offsetWidth
      );
      expect(position.top).toBeGreaterThanOrEqual(0);
      expect(position.top).toBeLessThanOrEqual(
        mockContainerRef.current.offsetHeight
      );
    });
  });

  test("handles empty items array", () => {
    const { result } = renderHook(() =>
      useTimelinePositioning([], mockContainerRef)
    );

    expect(result.current.positions).toEqual([]);
  });

  test("handles single item", () => {
    const singleItem = [{ id: "1", releaseDate: "2024-01-15" }];
    const { result } = renderHook(() =>
      useTimelinePositioning(singleItem, mockContainerRef)
    );

    expect(result.current.positions).toHaveLength(1);
    expect(result.current.positions[0]).toEqual(
      expect.objectContaining({
        id: "1",
        left: expect.any(Number),
        top: expect.any(Number),
      })
    );
  });

  test("handles items with same release date", () => {
    const itemsWithSameDate = [
      { id: "1", releaseDate: "2024-01-15" },
      { id: "2", releaseDate: "2024-01-15" },
      { id: "3", releaseDate: "2024-01-15" },
    ];

    const { result } = renderHook(() =>
      useTimelinePositioning(itemsWithSameDate, mockContainerRef)
    );

    const positions = result.current.positions;

    // Items should have the same horizontal position but different vertical positions
    expect(positions[0].left).toBe(positions[1].left);
    expect(positions[1].left).toBe(positions[2].left);
    expect(positions[0].top).not.toBe(positions[1].top);
    expect(positions[1].top).not.toBe(positions[2].top);
  });

  test("handles custom options", () => {
    const customOptions = {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      verticalSpacing: 100,
      verticalLanes: 5,
      horizontalPadding: 50,
    };

    const { result } = renderHook(() =>
      useTimelinePositioning(mockItems, mockContainerRef, customOptions)
    );

    result.current.positions.forEach((position) => {
      expect(position.left).toBeGreaterThanOrEqual(
        customOptions.horizontalPadding
      );
      expect(position.left).toBeLessThanOrEqual(
        mockContainerRef.current.offsetWidth - customOptions.horizontalPadding
      );
    });
  });

  test("recalculates positions when items change", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useTimelinePositioning(items, mockContainerRef),
      { initialProps: { items: mockItems } }
    );

    const initialPositions = [...result.current.positions];

    // Add a new item
    const newItems = [...mockItems, { id: "4", releaseDate: "2024-03-01" }];

    rerender({ items: newItems });

    expect(result.current.positions).toHaveLength(newItems.length);
    expect(result.current.positions).not.toEqual(initialPositions);
  });

  test("recalculates positions when container size changes", () => {
    const { result, rerender } = renderHook(
      ({ containerRef }) => useTimelinePositioning(mockItems, containerRef),
      {
        initialProps: {
          containerRef: {
            current: { offsetWidth: 1000, offsetHeight: 500 },
          },
        },
      }
    );

    const initialPositions = [...result.current.positions];

    // Change container size
    const newContainerRef = {
      current: { offsetWidth: 1500, offsetHeight: 800 },
    };

    rerender({ containerRef: newContainerRef });

    expect(result.current.positions).not.toEqual(initialPositions);
  });
});
