import { createSequencerEvent } from '@model/sequencerEvent';
import { initialContext } from '@model/store/store';
import { SequencerEvent, SequencerExport } from '@model/types';
import {
  exportSequencerEventsToJSON,
  exportSequencerToJSON,
  exportSequencerToURLString,
  importSequencerEventsFromJSON,
  importSequencerFromJSON,
  importSequencerFromURLString
} from '../sequencer';

describe('sequencer serialization', () => {
  describe('exportSequencerToJSON', () => {
    it('should return undefined for undefined input', () => {
      expect(exportSequencerToJSON(undefined)).toBeUndefined();
    });

    it('should correctly export sequencer state', () => {
      const sequencer = {
        bpm: 120,
        time: 0,
        endTime: 4,
        events: [
          createSequencerEvent({ padId: 'pad1', time: 0, duration: 1 }),
          createSequencerEvent({ padId: 'pad1', time: 2, duration: 0.5 }),
          createSequencerEvent({ padId: 'pad2', time: 1, duration: 2 })
        ]
      };

      const result = exportSequencerToJSON(sequencer);

      expect(result).toEqual({
        bpm: 120,
        time: 0,
        endTime: 4,
        events: {
          pad1: [
            [0, 1],
            [2, 0.5]
          ],
          pad2: [[1, 2]]
        }
      });
    });
  });

  describe('importSequencerFromJSON', () => {
    it('should return initial context for undefined input', () => {
      expect(importSequencerFromJSON(undefined)).toEqual(
        initialContext.sequencer
      );
    });

    it('should correctly import sequencer state', () => {
      const json: SequencerExport = {
        bpm: 140,
        time: 0,
        endTime: 8,
        events: {
          pad1: [
            [0, 1],
            [2, 0.5]
          ],
          pad2: [[1, 2]]
        }
      };

      const result = importSequencerFromJSON(json);

      expect(result.bpm).toBe(140);
      expect(result.time).toBe(0);
      expect(result.endTime).toBe(8);
      expect(result.events).toHaveLength(3);

      // Check events are correctly reconstructed
      const pad1Events = result.events.filter((e) => e.padId === 'pad1');
      expect(pad1Events).toHaveLength(2);
      expect(pad1Events[0]).toEqual(
        expect.objectContaining({ time: 0, duration: 1 })
      );
      expect(pad1Events[1]).toEqual(
        expect.objectContaining({ time: 2, duration: 0.5 })
      );

      const pad2Events = result.events.filter((e) => e.padId === 'pad2');
      expect(pad2Events).toHaveLength(1);
      expect(pad2Events[0]).toEqual(
        expect.objectContaining({ time: 1, duration: 2 })
      );
    });
  });

  describe('exportSequencerEventsToJSON', () => {
    it('should return undefined for undefined input', () => {
      expect(
        exportSequencerEventsToJSON(undefined as unknown as SequencerEvent[])
      ).toBeUndefined();
    });

    it('should correctly group events by padId', () => {
      const events = [
        createSequencerEvent({ padId: 'pad1', time: 0, duration: 1 }),
        createSequencerEvent({ padId: 'pad2', time: 1, duration: 2 }),
        createSequencerEvent({ padId: 'pad1', time: 2, duration: 0.5 })
      ];

      const result = exportSequencerEventsToJSON(events);

      expect(result).toEqual({
        pad1: [
          [0, 1],
          [2, 0.5]
        ],
        pad2: [[1, 2]]
      });
    });
  });

  describe('importSequencerEventsFromJSON', () => {
    it('should return empty array for undefined input', () => {
      expect(importSequencerEventsFromJSON(undefined)).toEqual([]);
    });

    it('should correctly reconstruct events from JSON', () => {
      const json: SequencerExport['events'] = {
        pad1: [
          [0, 1],
          [2, 0.5]
        ],
        pad2: [[1, 2]]
      };

      const result = importSequencerEventsFromJSON(json);

      expect(result).toHaveLength(3);

      // Check pad1 events
      const pad1Events = result.filter((e) => e.padId === 'pad1');
      expect(pad1Events).toHaveLength(2);
      expect(pad1Events[0]).toEqual(
        expect.objectContaining({
          padId: 'pad1',
          time: 0,
          duration: 1
        })
      );
      expect(pad1Events[1]).toEqual(
        expect.objectContaining({
          padId: 'pad1',
          time: 2,
          duration: 0.5
        })
      );

      // Check pad2 events
      const pad2Events = result.filter((e) => e.padId === 'pad2');
      expect(pad2Events).toHaveLength(1);
      expect(pad2Events[0]).toEqual(
        expect.objectContaining({
          padId: 'pad2',
          time: 1,
          duration: 2
        })
      );
    });
  });

  describe('exportSequencerToURLString', () => {
    it('should return undefined for undefined input', () => {
      expect(exportSequencerToURLString(undefined)).toBeUndefined();
    });

    it('should correctly format sequencer state as URL string', () => {
      const sequencer = {
        bpm: 120,
        time: 0,
        endTime: 4,
        events: [
          createSequencerEvent({ padId: 'pad1', time: 0, duration: 1 }),
          createSequencerEvent({ padId: 'pad1', time: 2, duration: 0.5 }),
          createSequencerEvent({ padId: 'pad2', time: 1, duration: 2 })
        ]
      };

      const result = exportSequencerToURLString(sequencer);

      expect(result).toBe('120[0[4[pad1(0:1:2:0.5+pad2(1:2');
    });

    it('should handle sequencer with no events', () => {
      const sequencer = {
        bpm: 120,
        time: 0,
        endTime: 4,
        events: []
      };

      const result = exportSequencerToURLString(sequencer);

      expect(result).toBe('120[0[4[');
    });
  });

  describe('importSequencerFromURLString', () => {
    it('should correctly parse URL string into sequencer state', () => {
      const urlString = '120[0[4[pad1(0:1:2:0.5+pad2(1:2';

      const result = importSequencerFromURLString(urlString);

      expect(result).toEqual({
        bpm: 120,
        time: 0,
        endTime: 4,
        events: {
          pad1: [
            [0, 1],
            [2, 0.5]
          ],
          pad2: [[1, 2]]
        }
      });
    });

    it('should handle URL string with no events', () => {
      const urlString = '120[0[4[';

      const result = importSequencerFromURLString(urlString);

      expect(result).toEqual({
        bpm: 120,
        time: 0,
        endTime: 4,
        events: {}
      });
    });

    it('should correctly parse floating point numbers', () => {
      const urlString = '132.5[0.25[4.75[pad1(0.5:1.25';

      const result = importSequencerFromURLString(urlString);

      expect(result).toEqual({
        bpm: 132.5,
        time: 0.25,
        endTime: 4.75,
        events: {
          pad1: [[0.5, 1.25]]
        }
      });
    });
  });
});
