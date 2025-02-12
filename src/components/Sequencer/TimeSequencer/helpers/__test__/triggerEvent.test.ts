import { TriggerEvent } from '../../types';
import {
  TriggerNode,
  findNextTriggerEvent,
  findPreviousTriggerEvent,
  findTriggerEventsWithinTimeRange,
  insertTriggerEvent,
  triggerTreeCount
} from '../triggerEvent';

describe('triggerEvent', () => {
  describe('insertTriggerEvent', () => {
    it('should create a new node when tree is empty', () => {
      const event: TriggerEvent = {
        time: 1,
        padId: '1',
        event: 'pad:touchdown'
      };
      const result = insertTriggerEvent(undefined, event);

      expect(result).toEqual({
        event,
        left: undefined,
        right: undefined
      });
    });

    it('should insert events in correct order', () => {
      let root: TriggerNode | undefined;
      const events: TriggerEvent[] = [
        { time: 3, padId: '3', event: 'pad:touchdown' },
        { time: 1, padId: '1', event: 'pad:touchdown' },
        { time: 4, padId: '4', event: 'pad:touchdown' },
        { time: 2, padId: '2', event: 'pad:touchdown' }
      ];

      // Insert all events
      events.forEach((event) => {
        root = insertTriggerEvent(root, event);
      });

      // Verify structure
      expect(root?.event).toEqual(
        expect.objectContaining({ time: 3, padId: '3' })
      );
      expect(root?.left?.event).toEqual(
        expect.objectContaining({ time: 1, padId: '1' })
      );
      expect(root?.right?.event).toEqual(
        expect.objectContaining({ time: 4, padId: '4' })
      );
      expect(root?.left?.right?.event).toEqual(
        expect.objectContaining({ time: 2, padId: '2' })
      );
    });
  });

  describe('triggerTreeCount', () => {
    it('should return 0 for an empty tree', () => {
      const result = triggerTreeCount(undefined);
      expect(result).toBe(0);
    });

    it('should return the correct count for a tree with events', () => {
      const events: TriggerEvent[] = [
        { time: 3, padId: '3', event: 'pad:touchdown' },
        { time: 1, padId: '1', event: 'pad:touchdown' },
        { time: 4, padId: '3', event: 'pad:touchup' },
        { time: 2, padId: '1', event: 'pad:touchup' },
        { time: 5, padId: '5', event: 'pad:touchdown' },
        { time: 6, padId: '5', event: 'pad:touchup' }
      ];

      let root: TriggerNode | undefined;
      events.forEach((event) => {
        root = insertTriggerEvent(root, event);
      });

      const result = triggerTreeCount(root);
      expect(result).toBe(6);
    });
  });

  describe('findTriggerEvent', () => {
    let root: TriggerNode | undefined;

    beforeEach(() => {
      // Create a test tree
      const events: TriggerEvent[] = [
        { time: 3, padId: '3', event: 'pad:touchdown' },
        { time: 1, padId: '1', event: 'pad:touchdown' },
        { time: 4, padId: '3', event: 'pad:touchup' },
        { time: 2, padId: '1', event: 'pad:touchup' },
        { time: 5, padId: '5', event: 'pad:touchdown' },
        { time: 6, padId: '5', event: 'pad:touchup' }
      ];

      root = undefined;
      events.forEach((event) => {
        root = insertTriggerEvent(root, event);
      });
    });

    it('should find the nearest event after given time', () => {
      expect(findNextTriggerEvent(root, 0)?.time).toBe(1);
      expect(findNextTriggerEvent(root, 1.5)?.time).toBe(2);
      expect(findNextTriggerEvent(root, 2.5)?.time).toBe(3);
      expect(findNextTriggerEvent(root, 3.5)?.time).toBe(4);
      expect(findNextTriggerEvent(root, 4.5)?.time).toBe(5);
    });

    it('should return undefined when no events after given time', () => {
      expect(findNextTriggerEvent(root, 6.5)).toBeUndefined();
    });

    it('should return undefined for empty tree', () => {
      expect(findNextTriggerEvent(undefined, 1)).toBeUndefined();
    });

    it('should handle exact time matches', () => {
      expect(findNextTriggerEvent(root, 3)?.time).toBe(4);
      expect(findNextTriggerEvent(root, 4)?.time).toBe(5);
    });

    it('should find the nearest event before given time', () => {
      expect(findPreviousTriggerEvent(root, 10)?.time).toBe(6);
      expect(findPreviousTriggerEvent(root, 4.5)?.time).toBe(4);
      expect(findPreviousTriggerEvent(root, 2.99)?.time).toBe(2);
      expect(findPreviousTriggerEvent(root, 1)?.time).toBe(undefined);
    });
  });

  describe('findTriggerEventsWithinTimeRange', () => {
    let root: TriggerNode | undefined;

    beforeEach(() => {
      // Create a test tree
      const events: TriggerEvent[] = [
        { time: 3, padId: '3', event: 'pad:touchdown' },
        { time: 1, padId: '1', event: 'pad:touchdown' },
        { time: 4, padId: '3', event: 'pad:touchup' },
        { time: 2, padId: '1', event: 'pad:touchup' },
        { time: 5, padId: '5', event: 'pad:touchdown' },
        { time: 6, padId: '5', event: 'pad:touchup' }
      ];

      root = undefined;
      events.forEach((event) => {
        root = insertTriggerEvent(root, event);
      });
    });

    it('should find all events within time range', () => {
      const events = findTriggerEventsWithinTimeRange(root, 2, 4);
      expect(events).toHaveLength(3);
      expect(events.map((e) => e.time)).toEqual([2, 3, 4]);
    });

    it('should handle exact boundary matches', () => {
      const events = findTriggerEventsWithinTimeRange(root, 1, 6);
      expect(events).toHaveLength(6);
      expect(events.map((e) => e.time)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should return empty array when no events in range', () => {
      const events = findTriggerEventsWithinTimeRange(root, 7, 10);
      expect(events).toHaveLength(0);
    });

    it('should return empty array for empty tree', () => {
      const events = findTriggerEventsWithinTimeRange(undefined, 1, 4);
      expect(events).toHaveLength(0);
    });

    it('should handle zero-length range', () => {
      const events = findTriggerEventsWithinTimeRange(root, 3, 3);
      expect(events).toHaveLength(1);
      expect(events[0].time).toBe(3);
    });
  });
});
