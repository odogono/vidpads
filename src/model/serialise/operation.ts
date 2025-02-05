import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';
import {
  LabelOperation,
  LoopOperation,
  Operation,
  OperationExport,
  OperationType,
  PlaybackOperation,
  PlaybackRateOperation,
  SourceOperation,
  TrimOperation,
  VolumeKeyPoint,
  VolumeOperation
} from '@model/types';
import { isPadPlaybackOperationEmpty } from '../pad';
import { expandUrl, shortenUrl } from './helpers';

export const exportOperationToJSON = (
  operation: Operation | undefined
): OperationExport | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Source) {
    const { url } = operation as SourceOperation;
    return {
      type: operation.type,
      url: url
    } as SourceOperation;
  }

  if (operation.type === OperationType.PlaybackRate) {
    const { rate } = operation as PlaybackRateOperation;
    return {
      type: operation.type,
      rate: roundDP(rate)
    } as PlaybackRateOperation;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return {
      type: operation.type,
      start: roundDP(start),
      end: roundDP(end)
    } as TrimOperation;
  }

  if (operation.type === OperationType.Volume) {
    const { envelope } = operation as VolumeOperation;
    return {
      type: operation.type,
      envelope: envelope.map((e) => ({
        time: roundDP(e.time),
        value: roundDP(e.value)
      }))
    } as VolumeOperation;
  }

  if (operation.type === OperationType.Loop) {
    const { start } = operation as LoopOperation;
    if (start === undefined || start === -1) {
      return undefined;
    }
    return {
      type: operation.type,
      start: roundDP(start)
    } as LoopOperation;
  }

  if (operation.type === OperationType.Playback) {
    const { isOneShot, resume, priority, chokeGroup } =
      operation as PlaybackOperation;
    return {
      type: operation.type,
      isOneShot,
      resume,
      priority,
      chokeGroup
    } as PlaybackOperation;
  }
  return undefined;
};

export const importOperationFromJSON = (
  operation: OperationExport | undefined
): Operation | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Source) {
    const { url } = operation as SourceOperation;
    return {
      type: operation.type,
      url: url
    } as SourceOperation;
  }

  if (operation.type === OperationType.PlaybackRate) {
    const { rate } = operation as PlaybackRateOperation;
    return {
      type: OperationType.PlaybackRate,
      rate,
      preservePitch: true
    } as PlaybackRateOperation;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return { type: OperationType.Trim, start, end } as TrimOperation;
  }

  if (operation.type === OperationType.Volume) {
    const { envelope } = operation as VolumeOperation;
    return {
      type: OperationType.Volume,
      envelope: envelope.map((e) => ({
        time: e.time,
        value: e.value
      }))
    } as VolumeOperation;
  }

  if (operation.type === OperationType.Loop) {
    const { start } = operation as LoopOperation;
    return { type: OperationType.Loop, start } as LoopOperation;
  }

  if (operation.type === OperationType.Playback) {
    if (isPadPlaybackOperationEmpty(operation as PlaybackOperation)) {
      return undefined;
    }

    const { isOneShot, resume, priority, chokeGroup } =
      operation as PlaybackOperation;

    return {
      type: OperationType.Playback,
      isOneShot,
      resume,
      priority,
      chokeGroup
    } as PlaybackOperation;
  }

  return undefined;
};

const OperationTypeCodes: Record<OperationType, string> = {
  [OperationType.PlaybackRate]: 'pb',
  [OperationType.Trim]: 't',
  [OperationType.Volume]: 'v',
  [OperationType.Source]: 's',
  [OperationType.Duration]: 'd',
  [OperationType.Resize]: 'r',
  [OperationType.AddEffect]: 'a',
  [OperationType.AddTransition]: 't',
  [OperationType.Loop]: 'l',
  [OperationType.Label]: 'b',
  [OperationType.Playback]: 'p'
} as const;

export const exportOperationToURL = (
  operation: Operation | undefined
): string | undefined => {
  if (!operation) {
    return '';
  }

  const code = OperationTypeCodes[operation.type];

  if (!code) {
    return '';
  }

  if (operation.type === OperationType.Source) {
    const { url } = operation as SourceOperation;
    const shortUrl = shortenUrl(url);
    return `${code}:${shortUrl}`;
  }

  if (operation.type === OperationType.Label) {
    const { label } = operation as LabelOperation;
    return `${code}:${btoa(encodeURIComponent(label))}`;
  }

  if (operation.type === OperationType.PlaybackRate) {
    const { rate } = operation as PlaybackRateOperation;
    return `${code}:${roundDP(rate)}`;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return `${code}:${roundDP(start)}:${roundDP(end)}`;
  }

  if (operation.type === OperationType.Volume) {
    const { envelope } = operation as VolumeOperation;
    return `${code}:${envelope
      .map((e) => `${roundDP(e.time)}:${roundDP(e.value)}`)
      .join(':')}`;
  }

  if (operation.type === OperationType.Loop) {
    const { start } = operation as LoopOperation;
    if (start !== undefined && start !== -1) {
      return `${code}:${roundDP(start)}`;
    }
  }

  if (operation.type === OperationType.Playback) {
    const { isOneShot, resume, priority, chokeGroup } =
      operation as PlaybackOperation;
    const parts = [];
    parts.push(isOneShot ? '1' : '0');
    parts.push(resume ? '1' : '0');
    parts.push(priority !== undefined ? priority.toString() : '');
    parts.push(chokeGroup !== undefined ? chokeGroup.toString() : '');
    return `${code}:${parts.join(':')}`;
  }

  return '';
};

export const importOperationFromURL = (
  urlString: string
): OperationExport | undefined => {
  const [type, ...rest] = urlString.split(':');

  if (type === OperationTypeCodes[OperationType.Source]) {
    const [url] = rest;
    const expandedUrl = expandUrl(url);
    return {
      type: OperationType.Source,
      url: expandedUrl
    } as SourceOperation;
  }

  if (type === OperationTypeCodes[OperationType.Label]) {
    const [label] = rest;
    const decodedLabel = decodeURIComponent(atob(label));
    return {
      type: OperationType.Label,
      label: decodedLabel
    } as LabelOperation;
  }
  if (type === OperationTypeCodes[OperationType.PlaybackRate]) {
    const [rate] = rest;
    return {
      type: OperationType.PlaybackRate,
      rate: parseFloat(rate),
      preservePitch: true
    } as PlaybackRateOperation;
  }

  if (type === OperationTypeCodes[OperationType.Trim]) {
    const [start, end] = rest;
    return {
      type: OperationType.Trim,
      start: parseFloat(start),
      end: parseFloat(end)
    } as TrimOperation;
  }

  if (type === OperationTypeCodes[OperationType.Loop]) {
    const [start] = rest;
    return {
      type: OperationType.Loop,
      start: parseFloat(start)
    } as LoopOperation;
  }

  if (type === OperationTypeCodes[OperationType.Playback]) {
    const [isOneShot, resume, priority, chokeGroup] = rest;
    return {
      type: OperationType.Playback,
      isOneShot: isOneShot === '1',
      resume: resume === '1',
      priority: priority !== '' ? parseInt(priority) : undefined,
      chokeGroup: chokeGroup !== '' ? parseInt(chokeGroup) : undefined
    } as PlaybackOperation;
  }

  if (type === OperationTypeCodes[OperationType.Volume]) {
    const values = rest.map((v) => parseFloat(v));

    const [envelope] = values.reduce(
      ([acc, time], v, index) => {
        if (index % 2 === 0) {
          return [acc, v];
        }

        acc.push({
          time: time,
          value: v
        });

        return [acc, 0];
      },
      [[] as VolumeKeyPoint[], 0]
    );

    return {
      type: OperationType.Volume,
      envelope: envelope
    } as VolumeOperation;
  }

  return undefined;
};
