import { toPadThumbnailUrl } from '../helpers/metadata';
import { roundNumberToDecimalPlaces } from '../helpers/number';
import {
  Interval,
  Operation,
  OperationType,
  Pad,
  PlaybackRateOperation,
  TrimOperation,
  VolumeOperation
} from './types';

export const createPad = (id: string): Pad => {
  return {
    id,
    pipeline: {
      source: undefined,
      operations: []
    }
  };
};

export const setPadSource = (
  pad: Pad | undefined,
  source: string
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  return {
    ...pad,
    pipeline: {
      ...pad.pipeline,
      source: {
        type: OperationType.Source,
        url: source
      }
    }
  };
};

export const setPadInterval = (
  pad: Pad | undefined,
  interval: Interval
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  const { start, end } = { ...{ start: 0, end: -1 }, ...interval };

  const newOp: TrimOperation = {
    type: OperationType.Trim,
    start: roundNumberToDecimalPlaces(start),
    end: roundNumberToDecimalPlaces(end)
  };

  return addOrReplacePadOperation(pad, newOp);
};

/**
 * Adds or replaces an operation in the pad's pipeline.
 *
 * @param pad - The pad to add or replace the operation in.
 * @param operation - The operation to add or replace.
 * @returns The new pipeline operations.
 */
export const addOrReplacePadOperation = (
  pad: Pad | undefined,
  operation: Operation
): Pad | undefined => {
  if (!pad) {
    return undefined;
  }

  const operations = pad.pipeline.operations ?? [];

  let isFound = false;
  const newOperations = operations.reduce((acc, op) => {
    if (op.type === operation.type) {
      isFound = true;
      return [...acc, operation];
    }
    return [...acc, op];
  }, [] as Operation[]);

  if (!isFound) {
    newOperations.push(operation);
  }

  return {
    ...pad,
    pipeline: {
      ...pad.pipeline,
      operations: newOperations
    }
  };
};

export const exportToURL = (pad: Pad): string => {
  return toPadThumbnailUrl(pad.id);
};

export const copyPad = (pad: Pad): Pad => {
  return JSON.parse(JSON.stringify(pad));
};

export const getPadSourceUrl = (pad?: Pad | undefined): string | undefined => {
  return pad?.pipeline.source?.url;
};

export const getPadVolume = (pad: Pad | undefined, defaultTo: number = 1) => {
  if (!pad) {
    return defaultTo;
  }

  const operation = getPadOperation(pad, OperationType.Volume);

  if (!operation) {
    return defaultTo;
  }

  const { envelope } = operation as VolumeOperation;

  if (!envelope || envelope.length === 0) {
    return defaultTo;
  }

  const lastVolume = envelope[envelope.length - 1];

  const { value } = lastVolume;

  if (value === undefined || value === null || isNaN(value)) {
    return defaultTo;
  }

  return value;
};

export const getPadInterval = (
  pad: Pad | undefined,
  defaultTo?: Interval | undefined
): Interval | undefined => {
  if (!pad) {
    return defaultTo;
  }

  const trimOperation = getPadOperation(pad, OperationType.Trim) as
    | TrimOperation
    | undefined;

  if (!trimOperation) {
    return defaultTo;
  }

  let { start, end } = trimOperation;

  if (start === -1 && defaultTo?.start !== undefined) {
    start = defaultTo.start;
  }

  if (end === -1 && defaultTo?.end !== undefined) {
    end = defaultTo.end;
  }

  return {
    start,
    end
  };
};

export const getPadPlaybackRate = (
  pad: Pad | undefined,
  defaultTo: number = 1
): number => {
  if (!pad) {
    return defaultTo;
  }

  const operation = getPadOperation(pad, OperationType.PlaybackRate);

  if (!operation) {
    return defaultTo;
  }

  const { rate } = operation as PlaybackRateOperation;

  return rate;
};

export const getPadOperation = (pad: Pad, type: OperationType) => {
  return pad.pipeline?.operations?.find((operation) => operation.type === type);
};
