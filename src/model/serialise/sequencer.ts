import {
  roundNumberToDecimalPlaces as roundDP,
  safeParseFloat
} from '@helpers/number';
import { ProjectStoreContextType } from '@model/store/types';
import { createSequencerEvent } from '../sequencerEvent';
import { initialContext } from '../store/store';
import { SequencerEvent, SequencerExport } from '../types';

type SequencerType = ProjectStoreContextType['sequencer'];

export const exportSequencerToJSON = (
  sequencer: SequencerType | undefined
): SequencerExport | undefined => {
  if (!sequencer) {
    return undefined;
  }

  const { bpm, events, time, endTime, isLooped = true } = sequencer;

  const eventsJSON = exportSequencerEventsToJSON(events);

  if (
    (!eventsJSON || Object.keys(eventsJSON).length === 0) &&
    initialContext.sequencer.endTime === endTime
  ) {
    return undefined;
  }

  return {
    bpm,
    isLooped,
    time: roundDP(time),
    endTime: roundDP(endTime),
    events: eventsJSON
  };
};

export const importSequencerFromJSON = (json: SequencerExport | undefined) => {
  if (!json) {
    return initialContext.sequencer;
  }

  const { bpm, time, endTime, events, isLooped = true } = json;

  return {
    bpm,
    time,
    endTime,
    isLooped,
    events: importSequencerEventsFromJSON(events)
  };
};

export const exportSequencerEventsToJSON = (events: SequencerEvent[]) => {
  if (!events) {
    return undefined;
  }

  const padMap: Record<string, [number, number][]> = {};

  for (const event of events) {
    const { padId, time, duration } = event;
    const padEvents = padMap[padId] ?? [];
    padEvents.push([roundDP(time), roundDP(duration)]);
    padMap[padId] = padEvents;
  }

  return padMap;
};

export const importSequencerEventsFromJSON = (
  json: SequencerExport['events']
): SequencerEvent[] => {
  if (!json) {
    return [];
  }

  return Object.entries(json).reduce((acc, [padId, padEvents]) => {
    for (const [time, duration] of padEvents) {
      acc.push(createSequencerEvent({ padId, time, duration }));
    }
    return acc;
  }, [] as SequencerEvent[]);
};

export const exportSequencerToURLString = (
  sequencer: SequencerType | undefined
) => {
  const json = exportSequencerToJSON(sequencer);
  if (!json) {
    return undefined;
  }

  const { bpm, time, endTime, events } = json;

  const eventsStr = events
    ? Object.entries(events)
        .reduce((acc, [padId, padEvents]) => {
          const padEventsStr = padEvents
            .map(([time, duration]) => `${time}:${duration}`)
            .join(':');
          acc.push(`${padId}(${padEventsStr}`);
          return acc;
        }, [] as string[])
        .join('+')
    : '';

  return `${bpm}[${time}[${endTime}[${eventsStr}`;
};

export const exportSequencerToURLStringV4 = (
  sequencer: SequencerType | undefined
) => {
  const json = exportSequencerToJSON(sequencer);
  if (!json) {
    return undefined;
  }

  const { bpm, isLooped, time, endTime, events } = json;

  const eventsStr = events
    ? Object.entries(events)
        .reduce((acc, [padId, padEvents]) => {
          const padEventsStr = padEvents
            .map(([time, duration]) => `${time}:${duration}`)
            .join(':');
          acc.push(`${padId}(${padEventsStr}`);
          return acc;
        }, [] as string[])
        .join('+')
    : '';

  const isLoopedStr = isLooped ? '1' : '';

  return `${bpm}[${isLoopedStr}[${time}[${endTime}[${eventsStr}`;
};

export const importSequencerFromURLString = (
  urlString: string
): SequencerExport => {
  const [bpm, time, endTime, eventsStr] = urlString.split('[');

  const events = parseEventsURL(eventsStr);

  return {
    bpm: safeParseFloat(bpm),
    isLooped: true,
    time: safeParseFloat(time),
    endTime: safeParseFloat(endTime),
    events
  };
};
export const importSequencerFromURLStringV4 = (
  urlString: string
): SequencerExport => {
  const [bpm, isLooped, time, endTime, eventsStr] = urlString.split('[');

  const events = parseEventsURL(eventsStr);

  return {
    bpm: safeParseFloat(bpm),
    isLooped: isLooped === '1',
    time: safeParseFloat(time),
    endTime: safeParseFloat(endTime),
    events
  };
};

const parseEventsURL = (eventsStr: string | undefined) => {
  if (!eventsStr || eventsStr.length === 0) return {};

  return eventsStr.split('+').reduce<SequencerExport['events']>(
    (acc, entry) => {
      const [padId, times] = entry.split('(');

      const [, eventsArray] = times
        .split(':')
        .reduce<[number[], [number, number][]]>(
          ([timeAcc, timeList], time, index) => {
            timeAcc.push(safeParseFloat(time));
            if (index % 2 !== 0) {
              timeList.push(timeAcc as [number, number]);
              return [[], timeList];
            }
            return [timeAcc, timeList];
          },
          [[], []]
        );

      acc![padId] = eventsArray;

      return acc;
    },
    {} as Record<string, [number, number][]>
  );
};
