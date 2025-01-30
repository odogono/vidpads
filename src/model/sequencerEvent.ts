import { SequencerEvent } from './types';

let eventIdCount = 0;

export const createSequencerEvent = ({
  padId,
  time = 0,
  duration = 0.1
}: {
  padId: string;
  time?: number;
  duration?: number;
}) => {
  const id = eventIdCount++;
  return {
    padId,
    time,
    duration,
    id
  };
};

export const joinEvents = (
  ...events: SequencerEvent[]
): SequencerEvent | undefined => {
  if (events.length === 0) return undefined;
  const padId = events[0].padId;

  const [time, timeEnd] = events.reduce(
    (acc, evt) => {
      if (evt.padId !== padId) return acc;
      return [
        Math.min(acc[0], evt.time),
        Math.max(acc[1], evt.time + evt.duration)
      ];
    },
    [events[0].time, events[0].time + events[0].duration]
  );

  return createSequencerEvent({
    padId,
    time,
    duration: timeEnd - time
  });
};

export const doEventsIntersect = (
  evtA: SequencerEvent,
  evtB: SequencerEvent
) => {
  if (evtA.padId !== evtB.padId) return false;

  const target = evtA.time <= evtB.time ? evtA : evtB;
  const other = target === evtA ? evtB : evtA;
  const targetTimeEnd = target.time + target.duration;
  const otherTimeEnd = other.time + other.duration;

  return targetTimeEnd >= other.time && otherTimeEnd >= target.time;
};

/**
 * Quantize events to the nearest multiple of the quantizeStep
 * eg. quantizeStep = 4
 * 1.3 = 1.25
 * 1.7 = 1.75
 * @param evts
 * @param quantizeStep
 * @returns
 */
export const quantizeEvents = (
  evts: SequencerEvent[],
  quantizeStep: number = 1
) => {
  return evts.map((evt) => ({
    ...evt,
    time: quantizeSeconds(evt.time, quantizeStep),
    duration: quantizeSeconds(evt.duration, quantizeStep)
  }));
};

export const quantizeSeconds = (seconds: number, quantizeStep: number = 1) => {
  return Math.max(0, Math.floor(seconds / quantizeStep) * quantizeStep);
};

export const areEventsEqual = (evtA: SequencerEvent, evtB: SequencerEvent) => {
  return evtA.padId === evtB.padId && evtA.time === evtB.time;
};

export const getEventMin = (evtA: SequencerEvent, evtB: SequencerEvent) => {
  return evtA.time <= evtB.time ? evtA : evtB;
};

export const getEventMax = (evtA: SequencerEvent, evtB: SequencerEvent) => {
  return evtA.time >= evtB.time ? evtA : evtB;
};

export const getEventKey = (evt: SequencerEvent) => {
  return `${evt.padId}-${evt.time}`;
};

export const getIntersectingEvents = (
  evts: SequencerEvent[],
  time: number,
  duration: number,
  padIds: string[]
): SequencerEvent[] => {
  if (padIds.length === 0) return [];
  return evts.filter((evt) => {
    return (
      padIds.includes(evt.padId) &&
      evt.time <= time + duration &&
      evt.time + evt.duration >= time
    );
  });
};

export const removeEvents = (
  from: SequencerEvent[],
  ...events: SequencerEvent[]
) => {
  return from.filter((evt) => !events.includes(evt));
};

/**
 * Combines two arrays of events into a single non-duplicate array
 * @param events
 * @returns
 */
export const mergeEvents = (...events: SequencerEvent[]): SequencerEvent[] => {
  const eventIdMap = new Map<number, SequencerEvent>();

  events.forEach((evt) => {
    const key = evt.id;
    if (!eventIdMap.has(key)) {
      eventIdMap.set(key, evt);
    }
  });

  return Array.from(eventIdMap.values()).toSorted((a, b) => a.time - b.time);
};

export const padIdToRowIndex = (padId: string) => {
  return parseInt(padId.slice(1)) - 1;
};

export const rowIndexToPadId = (rowIndex: number) => {
  return `a${rowIndex + 1}`;
};
