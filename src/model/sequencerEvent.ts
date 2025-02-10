import { SequencerEvent } from './types';

let eventIdCount = 0;

export const createSequencerEvent = ({
  padId,
  time = 0,
  duration = 0.1,
  isSelected
}: {
  padId: string;
  time?: number;
  duration?: number;
  isSelected?: boolean;
}): SequencerEvent => {
  const id = eventIdCount++;
  return {
    padId,
    time,
    duration,
    id,
    isSelected
  };
};

export const joinEvents = (events: SequencerEvent[]): SequencerEvent[] => {
  if (events.length === 0) return [];

  let candidateEvents: SequencerEvent[] = [...events];
  const resultEvents: SequencerEvent[] = [];

  while (candidateEvents.length > 0) {
    const evt = candidateEvents.shift();

    if (!evt) break;

    // find all events that intersect with the current event
    const [intersectingEvents, nonIntersectingEvents] = splitEvents(
      candidateEvents,
      (e) => doEventsIntersect(e, evt)
    );

    if (intersectingEvents.length === 0) {
      resultEvents.push(evt);
    } else {
      const combinedEvents = [...intersectingEvents, evt];
      const [time, timeEnd] = getEventBounds(combinedEvents);
      const isSelected = combinedEvents.some((e) => e.isSelected);
      const joinedEvent = createSequencerEvent({
        padId: evt.padId,
        time,
        duration: timeEnd - time,
        isSelected
      });
      // console.debug(
      //   'new joinedEvent',
      //   JSON.stringify(joinedEvent),
      //   'from',
      //   intersectingEvents
      // );

      candidateEvents = [...nonIntersectingEvents, joinedEvent];
    }
  }

  return mergeEvents(...resultEvents);
};

/**
 * Returns an array of events that intersect, and an array of events that do not
 * @param events
 * @param evt
 */
export const filterIntersectingEvents = (
  events: SequencerEvent[],
  evt: SequencerEvent
): [SequencerEvent[], SequencerEvent[]] => {
  const intersectingEvents = events.filter((e) => doEventsIntersect(evt, e));
  const nonIntersectingEvents = events.filter(
    (e) => !intersectingEvents.includes(e)
  );
  return [intersectingEvents, nonIntersectingEvents];
};

export const splitEvents = (
  events: SequencerEvent[],
  predicate: (evt: SequencerEvent) => boolean
) => {
  return events.reduce<[SequencerEvent[], SequencerEvent[]]>(
    ([selected, nonSelected], evt) => {
      if (predicate(evt)) {
        selected.push(evt);
      } else {
        nonSelected.push(evt);
      }
      return [selected, nonSelected];
    },
    [[], []]
  );
};

export const doEventsIntersect = (
  evtA: SequencerEvent,
  evtB: SequencerEvent
) => {
  if (evtA.id === evtB.id || evtA.padId !== evtB.padId) return false;

  const target = evtA.time <= evtB.time ? evtA : evtB;
  const other = target === evtA ? evtB : evtA;
  const targetTimeEnd = target.time + target.duration;
  const otherTimeEnd = other.time + other.duration;

  return targetTimeEnd > other.time && otherTimeEnd > target.time;
};

export const repeatEvents = (evts: SequencerEvent[], endTime: number) => {
  if (evts.length === 0) return [];

  // get the end time of the last event
  const [timeStart, timeEnd] = getEventBounds(evts);

  const newEvents: SequencerEvent[] = [];
  // let start = timeEnd;

  for (let i = 0; i < evts.length; i++) {
    const evt = evts[i];

    const time = (evt.time - timeStart + timeEnd) % endTime;

    // if the event duration is greater than the remaining time, clip the duration
    const duration =
      time + evt.duration > endTime ? endTime - time : evt.duration;

    const newEvt = createSequencerEvent({
      ...evt,
      time,
      duration
    });

    newEvents.push(newEvt);
  }

  return newEvents;
};

/**
 * Gets the time of the earliest event, and the time (+duration) of the latest event
 * @param evts
 * @returns
 */
export const getEventBounds = (evts: SequencerEvent[]) => {
  if (evts.length === 0) return [0, 0];

  const time = Math.min(...evts.map((evt) => evt.time));
  const timeEnd = Math.max(...evts.map((evt) => evt.time + evt.duration));

  return [time, timeEnd];
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
  quantizeStep: number = 1,
  quantizeDuration: boolean = true
) => {
  return evts.map((evt) => ({
    ...evt,
    time: quantizeSeconds(evt.time, quantizeStep),
    duration: quantizeDuration
      ? quantizeSeconds(evt.duration, quantizeStep)
      : evt.duration
  }));
};

export const quantizeSeconds = (seconds: number, quantizeStep: number = 1) => {
  return Math.max(0, Math.round(seconds * quantizeStep) / quantizeStep);
  // return Math.max(0, Math.floor(seconds / quantizeStep) * quantizeStep);
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
