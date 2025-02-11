import { SequencerEvent } from '@model/types';
import {
  doEventsIntersect,
  getIntersectingEvents,
  joinEvents,
  mergeEvents,
  repeatEvents,
  translateEvents
} from '../sequencerEvent';

describe('doEventsIntersect', () => {
  it('should return false for events with different padIds', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '2', time: 2, duration: 4 };

    expect(doEventsIntersect(evtA, evtB)).toBe(false);
  });

  it('should return true when events overlap in the middle', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 2, duration: 4 };

    expect(doEventsIntersect(evtA, evtB)).toBe(true);
  });

  it('should return false when events touch at endpoints', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 4, duration: 4 };

    expect(doEventsIntersect(evtA, evtB)).toBe(false);
  });

  it('should return false when events do not overlap', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 5, duration: 4 };

    expect(doEventsIntersect(evtA, evtB)).toBe(false);
  });

  it('should return true when one event contains another', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 8 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 2, duration: 4 };

    expect(doEventsIntersect(evtA, evtB)).toBe(true);
  });

  it('should handle events in reverse order', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 4, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 0, duration: 6 };

    expect(doEventsIntersect(evtA, evtB)).toBe(true);
  });

  it('should return false for identical events', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };

    expect(doEventsIntersect(evtA, evtB)).toBe(false);
  });
});

describe('joinEvents', () => {
  it('should not alter non-overlapping events', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 1 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 5, duration: 1 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([evtA, evtB]);
  });

  it('should join two adjacent events', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4.1 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 4, duration: 4 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([
      expect.objectContaining({
        padId: '1',
        time: 0,
        duration: 8
      })
    ]);
  });

  it('should join two overlapping events', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 6 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 4, duration: 4 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([
      expect.objectContaining({
        padId: '1',
        time: 0,
        duration: 8
      })
    ]);
  });

  it('should handle events in reverse order', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 4, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 0, duration: 6 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([
      expect.objectContaining({
        padId: '1',
        time: 0,
        duration: 8
      })
    ]);
  });

  it('should join when one event contains another', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 8 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 2, duration: 4 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([
      expect.objectContaining({
        padId: '1',
        time: 0,
        duration: 8
      })
    ]);
  });

  it('should preserve padId from earlier event', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 2, duration: 4 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([
      expect.objectContaining({
        padId: '1',
        time: 0,
        duration: 6
      })
    ]);
  });

  it('should handle events with gap between them', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '1', time: 6, duration: 4 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([evtA, evtB]);
  });

  it('should return the first event when joining events with different padIds', () => {
    const evtA: SequencerEvent = { id: 1, padId: '1', time: 0, duration: 4 };
    const evtB: SequencerEvent = { id: 2, padId: '2', time: 2, duration: 4 };

    const result = joinEvents([evtA, evtB]);
    expect(result).toEqual([evtA, evtB]);
  });

  it('should join multiple events', () => {
    const events = [
      { id: 1, padId: '1', time: 0, duration: 4 },
      { id: 2, padId: '1', time: 3.5, duration: 4 }, // ends at 7.5
      { id: 3, padId: '1', time: 7, duration: 4 }, // ends at 11
      { id: 4, padId: '1', time: 11, duration: 4 } // ends at 15
    ];

    const result = joinEvents(events);
    expect(result).toEqual([
      expect.objectContaining({ padId: '1', time: 0, duration: 11 }),
      expect.objectContaining({ padId: '1', time: 11, duration: 4 })
    ]);
  });

  it('should infect selection status', () => {
    const events = [
      { id: 1, padId: '1', time: 0, duration: 5, isSelected: true },
      { id: 2, padId: '1', time: 2, duration: 4 }
    ];

    expect(joinEvents(events)).toEqual([
      expect.objectContaining({
        padId: '1',
        time: 0,
        duration: 6,
        isSelected: true
      })
    ]);
  });
});

describe('getIntersectingEvents', () => {
  const events: SequencerEvent[] = [
    { id: 1, padId: '1', time: 0, duration: 4 }, // 0-4
    { id: 2, padId: '2', time: 2, duration: 4 }, // 2-6
    { id: 3, padId: '3', time: 8, duration: 4 }, // 8-12
    { id: 4, padId: '4', time: 10, duration: 2 } // 10-12
  ];

  it('should find events that overlap with start of range for specific padIds', () => {
    const intersecting = getIntersectingEvents(events, 3, 4, ['1', '2']);
    expect(intersecting).toHaveLength(2);
    expect(intersecting).toContainEqual(events[0]); // 0-4 overlaps with 3-7
    expect(intersecting).toContainEqual(events[1]); // 2-6 overlaps with 3-7
  });

  it('should only return events for specified padIds', () => {
    const intersecting = getIntersectingEvents(events, 3, 4, ['1']);
    expect(intersecting).toHaveLength(1);
    expect(intersecting).toContainEqual(events[0]); // only pad 1
  });

  it('should find events that overlap with end of range', () => {
    const intersecting = getIntersectingEvents(events, 9, 2, ['3', '4']);
    expect(intersecting).toHaveLength(2);
    expect(intersecting).toContainEqual(events[2]); // 8-12 overlaps with 9-11
    expect(intersecting).toContainEqual(events[3]); // 10-12 overlaps with 9-11
  });

  it('should find events completely contained within range', () => {
    const intersecting = getIntersectingEvents(events, 1, 6, ['1', '2']);
    expect(intersecting).toHaveLength(2);
    expect(intersecting).toContainEqual(events[0]); // 0-4 overlaps with 1-7
    expect(intersecting).toContainEqual(events[1]); // 2-6 is contained within 1-7
  });

  it('should return empty array when no events match padIds', () => {
    const intersecting = getIntersectingEvents(events, 0, 12, ['5', '6']);
    expect(intersecting).toHaveLength(0);
  });

  it('should return empty array when no events intersect timerange', () => {
    const intersecting = getIntersectingEvents(events, 8, 2, ['1', '2']);
    expect(intersecting).toHaveLength(0);
  });

  it('should handle zero duration events', () => {
    const intersecting = getIntersectingEvents(events, 2, 0, ['1', '2']);
    expect(intersecting).toHaveLength(2);
    expect(intersecting).toContainEqual(events[0]); // 0-4 contains point 2
    expect(intersecting).toContainEqual(events[1]); // 2-6 contains point 2
  });

  it('should handle empty events array', () => {
    const intersecting = getIntersectingEvents([], 0, 4, ['1']);
    expect(intersecting).toHaveLength(0);
  });

  it('should handle empty padIds array', () => {
    const intersecting = getIntersectingEvents(events, 0, 12, []);
    expect(intersecting).toHaveLength(0);
  });
});

describe('mergeEvents', () => {
  it('should merge events on different pads', () => {
    const events = [
      { id: 1, padId: '1', time: 0, duration: 4 },
      { id: 2, padId: '2', time: 2, duration: 4 }
    ];

    const result = mergeEvents(...events);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(events[0]);
    expect(result).toContainEqual(events[1]);
  });

  it('should merge identical events', () => {
    const events = [
      { id: 1, padId: '1', time: 0, duration: 4 },
      { id: 1, padId: '1', time: 0, duration: 4 }
    ];

    const result = mergeEvents(...events);
    expect(result).toHaveLength(1);
    expect(result).toContainEqual(events[0]);
  });
});

describe('repeatEvents', () => {
  it('should repeat an event', () => {
    const events = [{ id: 1, padId: '1', time: 0, duration: 4 }];

    const result = repeatEvents(events, 12);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ padId: '1', time: 4, duration: 4 })
    );
  });

  it('should repeat an event close to the endTime', () => {
    const events = [{ id: 1, padId: '1', time: 0, duration: 4 }];

    const result = repeatEvents(events, 6);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ padId: '1', time: 4, duration: 2 })
    );
  });

  it('should repeat an event close to the endTime', () => {
    const events = [{ id: 1, padId: '1', time: 8, duration: 2 }];

    const result = repeatEvents(events, 10);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ padId: '1', time: 0, duration: 2 })
    );
  });

  it('should repeat multiple events', () => {
    const events = [
      { id: 1, padId: '1', time: 0, duration: 2 },
      { id: 2, padId: '2', time: 3, duration: 2 }
    ];

    const result = repeatEvents(events, 12);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({ padId: '1', time: 5, duration: 2 })
    );
    expect(result[1]).toEqual(
      expect.objectContaining({ padId: '2', time: 8, duration: 2 })
    );
  });
});
describe('translateEvents', () => {
  it('should translate events', () => {
    const events = [{ id: 1, padId: 'a3', time: 10, duration: 4 }];

    const result = translateEvents(events, 3, 'a1');

    expect(result).toEqual([
      expect.objectContaining({ padId: 'a1', time: 3, duration: 4 })
    ]);
  });
});
