import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';
import {
  Operation,
  OperationExport,
  OperationType,
  PlaybackRateOperation,
  TrimOperation,
  VolumeKeyPoint,
  VolumeOperation
} from '@model/types';

export const exportOperationToJSON = (
  operation: Operation | undefined
): OperationExport | undefined => {
  if (!operation) {
    return undefined;
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

  return undefined;
};

export const importOperationFromJSON = (
  operation: OperationExport | undefined
): Operation | undefined => {
  if (!operation) {
    return undefined;
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

  return undefined;
};

export const exportOperationToURL = (
  operation: Operation | undefined
): string | undefined => {
  if (!operation) {
    return '';
  }

  if (operation.type === OperationType.PlaybackRate) {
    const { rate } = operation as PlaybackRateOperation;
    return `${operation.type}:${roundDP(rate)}`;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return `${operation.type}:${roundDP(start)}:${roundDP(end)}`;
  }
  if (operation.type === OperationType.Volume) {
    const { envelope } = operation as VolumeOperation;
    return `${operation.type}:${envelope.map((e) => `${roundDP(e.time)}:${roundDP(e.value)}`).join(':')}`;
  }

  return '';
};

export const importOperationFromURL = (
  urlString: string
): OperationExport | undefined => {
  const [type, ...rest] = urlString.split(':');

  if (type === OperationType.PlaybackRate) {
    const [rate] = rest;
    return {
      type: OperationType.PlaybackRate,
      rate: parseFloat(rate),
      preservePitch: true
    } as PlaybackRateOperation;
  }

  if (type === OperationType.Trim) {
    const [start, end] = rest;
    return {
      type: OperationType.Trim,
      start: parseFloat(start),
      end: parseFloat(end)
    } as TrimOperation;
  }

  if (type === OperationType.Volume) {
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
